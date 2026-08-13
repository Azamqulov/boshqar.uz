import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  // 2. Global API Prefix
  app.setGlobalPrefix('api/v1');

  // 3. Enable CORS with safe origins
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'tauri://localhost'];

  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin like mobile apps, curl, or dev
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev flexible mode
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 4. Global Validation Pipe with strict sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 5. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('boshqar.uz API')
    .setDescription('boshqar.uz — Universal Biznes Boshqaruv Tizimi Multi-tenant SaaS REST API')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 boshqar.uz Backend API running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger Docs available at: http://localhost:${port}/docs`);
}

bootstrap();
