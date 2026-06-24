import type { FastifyError, FastifyInstance } from 'fastify'

import { env } from '../config/env.js'

type ErrorResponse = {
  error: {
    code: string
    message: string
    details: unknown
  }
}

function getErrorCode(error: FastifyError): string {
  if (error.validation) {
    return 'VALIDATION_ERROR'
  }

  return error.code ?? 'INTERNAL_SERVER_ERROR'
}

export function registerErrorHandlers(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    const fastifyError = error as FastifyError
    const statusCode =
      fastifyError.statusCode ?? (fastifyError.validation ? 400 : 500)
    const isServerError = statusCode >= 500

    if (isServerError) {
      app.log.error(fastifyError)
    }

    const body: ErrorResponse = {
      error: {
        code: getErrorCode(fastifyError),
        message:
          isServerError && env.NODE_ENV === 'production'
            ? 'Internal server error'
            : fastifyError.message,
        details: fastifyError.validation ?? null,
      },
    }

    return reply.status(statusCode).send(body)
  })

  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
        details: null,
      },
    })
  })
}
