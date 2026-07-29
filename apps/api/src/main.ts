import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)

  app.setGlobalPrefix('api/v1')

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  })
  app.enableShutdownHooks()

  const port = Number(process.env.PORT || 4000)

  await app.listen(port, '0.0.0.0')

  console.log('Server is running on http://localhost:4000')
}

bootstrap()
  .then((r) => console.log('Bootstrap completed', r))
  .catch((e) => console.error('Bootstrap failed', e))
