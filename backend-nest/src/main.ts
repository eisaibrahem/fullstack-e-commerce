import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './users/transform/transform.interceptor.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw?.trim()) {
    return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  }
  return raw.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean);
}

function assertRequiredEnv(): void {
  const missing = ['DATABASE_URL', 'JWT_SECRET'].filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
}

async function bootstrap() {
  console.log('[nest] bootstrap start', { node: process.version, vercel: process.env.VERCEL });
  assertRequiredEnv();
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('E-Commerce Backend API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'E-Commerce API Docs',
    customCssUrl:
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
    ],
  });
  // End of Swagger configuration


  app.enableCors({
    origin: parseCorsOrigins(),
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log('[nest] listening on port', port);
}

bootstrap().catch((error: unknown) => {
  console.error('Nest bootstrap failed:', error);
  process.exit(1);
});
