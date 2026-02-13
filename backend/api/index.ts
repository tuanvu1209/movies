import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/nest-setup';

const expressApp = require('express')();
let appInitialized = false;

async function bootstrap(): Promise<void> {
  if (appInitialized) {
    return;
  }

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  configureApp(app);
  await app.init();
  appInitialized = true;
}

export default async function handler(req: any, res: any): Promise<void> {
  await bootstrap();
  expressApp(req, res);
}
