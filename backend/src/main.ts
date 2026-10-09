import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
app.enableCors({
  origin: [
    ...new Set([
      process.env.FRONTEND_URL,
      'http://localhost:4200',
    ].filter((origin): origin is string => Boolean(origin))),
  ],
});
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
