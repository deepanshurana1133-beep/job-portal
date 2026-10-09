import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL;
  if (isProduction && !frontendUrl) {
    throw new Error('FRONTEND_URL must be set in production');
  }

  const allowedOrigins = new Set<string>();
  if (frontendUrl) {
    const frontendOrigin = new URL(frontendUrl);
    if (!['http:', 'https:'].includes(frontendOrigin.protocol)) {
      throw new Error('FRONTEND_URL must use http or https');
    }
    allowedOrigins.add(frontendOrigin.origin);
  }
  if (!isProduction) {
    allowedOrigins.add('http://localhost:4200');
  }

  app.enableCors({
    origin: [...allowedOrigins],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
