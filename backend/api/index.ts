import type { Request, Response } from 'express';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { createApp } from '../src/main';

let appPromise: Promise<NestExpressApplication> | undefined;

export default async function handler(request: Request, response: Response) {
  appPromise ??= createApp();
  const app = await appPromise;
  return app.getHttpAdapter().getInstance()(request, response);
}
