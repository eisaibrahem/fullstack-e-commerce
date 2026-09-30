import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './users/transform/transform.interceptor.js';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(RequestLoggerMiddleware);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(process.env.PORT ?? 3003);
}
await bootstrap();
