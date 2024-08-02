package main

import (
	"context"
	"field-values/pkg/handler"
	"field-values/pkg/repository"
	"field-values/pkg/service"
	"fmt"
	"log"
	"net/url"
	"os"
	"time"

	_ "github.com/lib/pq"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)

func main() {
	if os.Getenv("GO_ENV") == "production" {
		err := godotenv.Load(".env.production")
		failOnError(err, "Error loading .env.production variables")
	} else {
		err := godotenv.Load(".env.development")
		failOnError(err, "Error loading .env.development variables")
	}

	m, err := migrate.New(
		"file://migrations",
		migrateUrl(),
	)
	failOnError(err, "Error connecting to database for run migrations")
	if err := m.Up(); err != nil && err.Error() != "no change" {
		failOnError(err, err.Error())
	}
	m.Close()

	db, err := repository.NewPostgresDB(repository.Config{
		Host:     os.Getenv("POSTGRES_HOST"),
		Port:     os.Getenv("POSTGRES_PORT"),
		Username: os.Getenv("POSTGRES_USER"),
		Password: os.Getenv("POSTGRES_PASSWORD"),
		DBName:   os.Getenv("POSTGRES_DB"),
		SSLMode:  os.Getenv("POSTGRES_SSLMODE"),
	})
	failOnError(err, "Failed to initialize db")
	defer db.Close()

	repos := repository.NewRepository(db)
	services := service.NewService(repos)
	handlers := handler.NewHandler(services)

	conn, err := amqp.Dial(rabbitUrl())
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"go_queue",
		false,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Failed to register a consumer")

	forever := make(chan bool)

	goroutinesNum := 5
	for i := 0; i < goroutinesNum; i++ {
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			for delivery := range msgs {

				response := handlers.Route(delivery.Body)

				err = ch.PublishWithContext(ctx,
					"",
					delivery.ReplyTo,
					false,
					false,
					amqp.Publishing{
						ContentType:   "application/json",
						CorrelationId: delivery.CorrelationId,
						Body:          response,
					},
				)
				failOnError(err, "Failed to publish a message")

				delivery.Ack(false)
			}
		}()
	}

	log.Printf("Go microservice started and listen RabbitMQ 'go_queue'")
	<-forever
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func rabbitUrl() string {
	return fmt.Sprintf(
		"amqp://%s:%s@%s:%s/%s",
		url.QueryEscape(os.Getenv("RABBITMQ_DEFAULT_USER")),
		url.QueryEscape(os.Getenv("RABBITMQ_DEFAULT_PASS")),
		url.QueryEscape(os.Getenv("RABBITMQ_HOST")),
		url.QueryEscape(os.Getenv("RABBITMQ_PORT")),
		url.QueryEscape(os.Getenv("RABBITMQ_DEFAULT_VHOST")),
	)
}

func migrateUrl() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		url.QueryEscape(os.Getenv("POSTGRES_USER")),
		url.QueryEscape(os.Getenv("POSTGRES_PASSWORD")),
		url.QueryEscape(os.Getenv("POSTGRES_HOST")),
		url.QueryEscape(os.Getenv("POSTGRES_PORT")),
		url.QueryEscape(os.Getenv("POSTGRES_DB")),
		url.QueryEscape(os.Getenv("POSTGRES_SSLMODE")),
	)
}
