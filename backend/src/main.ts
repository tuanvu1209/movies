import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './nest-setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  configureApp(app);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  if (process.env.NODE_ENV !== 'production') {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  }
}

bootstrap();
