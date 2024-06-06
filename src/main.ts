import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { prepareDB } from './db/prepare'

async function start() {
  await prepareDB()

	const PORT = process.env.PORT || 3000;
	const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('Тестовый node-server06 на фреймровке Nest')
    .setDescription('Документация на REST API')
    .setVersion('1.0.0')
    .addTag('ivanrod-gh')
    .build()
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

	await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
start()