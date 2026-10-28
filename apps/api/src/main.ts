import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from './app.module'

const logger = new Logger('Bootstrap')

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    rawBody: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)

  app.setGlobalPrefix('api/v1')

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
  app.enableShutdownHooks()

  const port = Number(process.env.PORT || 4000)

  await app.listen(port, '0.0.0.0')

  logger.log(`API is listening on port ${port}`)
}

void bootstrap().catch((error: unknown) => {
  const trace = error instanceof Error ? error.stack : undefined
  logger.error('API bootstrap failed', trace)
  process.exitCode = 1
})
