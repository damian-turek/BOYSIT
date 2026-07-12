import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  app.enableCors()

  await app.listen(4000, '0.0.0.0')

  console.log('Server is running on http://localhost:4000')
}

bootstrap()
  .then((r) => console.log('Bootstrap completed', r))
  .catch((e) => console.error('Bootstrap failed', e))
