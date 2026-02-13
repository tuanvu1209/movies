import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';

export function configureApp(app: NestExpressApplication): void {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3201').trim();

  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('hbs');

  // Optional middleware for lighter responses in production.
  try {
    const compression = require('compression');
    app.use(compression());
  } catch (e) {
    // Compression package is optional.
  }

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));

  const cookieParser = require('cookie-parser');
  app.use(cookieParser());

  app.enableCors({
    origin: [
      frontendUrl,
      'http://localhost:3201',
      'http://localhost:3000',
      'http://localhost:3101',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
