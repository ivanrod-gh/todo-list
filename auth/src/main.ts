import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function start() {
	const PORT = process.env.PORT || 3001;
	const app = await NestFactory.create(AppModule);
	app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [{
        protocol: 'amqp',
        hostname: process.env.RABBITMQ_HOST,
        port: +process.env.RABBITMQ_PORT,
        username: process.env.RABBITMQ_DEFAULT_USER,
        password: process.env.RABBITMQ_DEFAULT_PASS,
        locale: 'en_US',
        frameMax: 0,
        heartbeat: 0,
        vhost: process.env.RABBITMQ_DEFAULT_VHOST,
      }],
      queue: 'auth_queue',
      queueOptions: {
        durable: false
      },
    },
  });
  await app.startAllMicroservices();
  
  const config = new DocumentBuilder()
    .setTitle('Тестовый node-server07 на фреймровке Nest. Сервис auth')
    .setDescription('Документация на REST API')
    .setVersion('1.0.0')
    .addTag('ivanrod-gh')
    .build()
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

	await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
start()