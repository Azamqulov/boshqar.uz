import 'dotenv/config';
import { initSentry } from './instrument';
initSentry(); // Must be called BEFORE NestFactory and all other modules
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.validation';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';

async function bootstrap() {
  validateEnv();
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // 1. Request Body Size Limits for File / Image Uploads
  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ limit: '20mb', extended: true }));

  // 2. High-Performance HTTP Response Compression (Gzip / Deflate)
  app.use(
    compression({
      threshold: 512,
      level: 6,
    }),
  );

  // 2. Security Headers via Helmet
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  // 2. Global API Prefix
  app.setGlobalPrefix('api/v1');

  // 3. Enable CORS with safe origins
  const configuredOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  const defaultLocalOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'tauri://localhost',
  ];

  const allowedOrigins = Array.from(
    new Set([...configuredOrigins, ...(process.env.NODE_ENV !== 'production' ? defaultLocalOrigins : [])]),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin like mobile apps, server-to-server or curl
      if (!origin) return callback(null, true);

      if (configuredOrigins.includes('*')) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === '*' || allowed === origin) return true;
        if (allowed.startsWith('*.')) {
          const domain = allowed.slice(2);
          return origin.endsWith(domain);
        }
        return false;
      });

      if (
        isAllowed ||
        origin.includes('vercel.app') ||
        origin.includes('boshqar.uz') ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('CORS: ruxsat etilmagan origin'), false);
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

  // 5. Global Performance Interceptor (Response Time & Slow Query Alerts)
  app.useGlobalInterceptors(new PerformanceInterceptor());

  // 5. Swagger Documentation (Only enabled in development / staging)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('boshqar.uz API')
      .setDescription('boshqar.uz — Universal Biznes Boshqaruv Tizimi Multi-tenant SaaS REST API')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 boshqar.uz Backend API running on: http://0.0.0.0:${port}/api/v1`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 Swagger Docs available at: http://localhost:${port}/docs`);
  }
}

bootstrap();
