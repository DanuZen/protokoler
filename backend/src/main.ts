import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as path from 'path';

const expressApp = express();

// Increase JSON and URL-encoded parser limits for base64 file payloads
expressApp.use(express.json({ limit: '50mb' }));
expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve local uploads statically
expressApp.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));


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

// Standalone server: listen on specified port if not in Vercel serverless environment
if (!process.env.VERCEL) {
  bootstrap().then(async (nestApp) => {
    const port = process.env.PORT || 7860;
    await nestApp.listen(port, '0.0.0.0');
    console.log(`Backend NestJS berjalan di http://0.0.0.0:${port}`);
  });
}
