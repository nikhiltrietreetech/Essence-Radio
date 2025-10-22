import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Optional: set global prefix
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Essence Radio API')
    .setDescription('API for managing episodes, live broadcast, and uploads')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({ origin: '*' });

  await app.listen(5000);
}
bootstrap();
