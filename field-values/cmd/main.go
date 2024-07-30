package main

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)

func main() {
	err := godotenv.Load(".env.development")
	failOnError(err, "Error loading env variables")

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
			for d := range msgs {
				fmt.Println("request happend")

				// time.Sleep(time.Second * 3)

				fmt.Println(string(d.Body))

				response := 123

				err = ch.PublishWithContext(ctx,
					"",
					d.ReplyTo,
					false,
					false,
					amqp.Publishing{
						ContentType:   "application/json",
						CorrelationId: d.CorrelationId,
						Body:          []byte(strconv.Itoa(response)),
					},
				)
				failOnError(err, "Failed to publish a message")

				d.Ack(false)
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
