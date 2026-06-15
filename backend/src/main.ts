import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const expressApp = express();

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    app.setGlobalPrefix('api');

    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    await app.init();
  }
  return app;
}

// Serverless handler for Vercel
export default async function handler(req: any, res: any) {
  await bootstrap();
  expressApp(req, res);
}

// Local dev: only listen if not in Vercel environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  bootstrap().then(async (nestApp) => {
    const port = process.env.PORT || 4000;
    await nestApp.listen(port);
    console.log(`Backend NestJS berjalan di http://localhost:${port}`);
  });
}
