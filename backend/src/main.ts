import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const jwtSecret = process.env.JWT_SECRET;
  if (
    !jwtSecret ||
    jwtSecret.length < 32 ||
    jwtSecret.includes('replace-this')
  ) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured');
  }

  if (
    Boolean(process.env.EMAIL_USER) !==
    Boolean(process.env.EMAIL_PASSWORD)
  ) {
    throw new Error('EMAIL_USER and EMAIL_PASSWORD must be configured together');
  }

  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.FRONTEND_URL &&
    !process.env.CORS_ORIGINS
  ) {
    throw new Error('FRONTEND_URL must be configured in production');
  }

  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = (
    process.env.FRONTEND_URL ??
    process.env.CORS_ORIGINS ??
    'http://localhost:4200'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.includes('*')) {
    throw new Error('CORS_ORIGINS must not include a wildcard');
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const configuredPort = process.env.PORT ? Number(process.env.PORT) : 3000;
  if (
    !Number.isInteger(configuredPort) ||
    configuredPort < 1 ||
    configuredPort > 65535
  ) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  await app.listen(configuredPort);
}

void bootstrap();
