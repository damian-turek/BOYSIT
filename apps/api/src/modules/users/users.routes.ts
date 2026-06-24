import type { FastifyPluginAsync } from 'fastify'

import { meUpdateSchema } from './users.schemas.js'
import { usersService } from './users.service.js'

type MeUpdateBody = {
  name?: string
}

export const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/v1/me', async (request, reply) => {
    if (!request.currentUser) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication is required',
          details: null,
        },
      })
    }

    return {
      data: request.currentUser,
    }
  })

  app.patch(
    '/api/v1/me',
    {
      schema: {
        body: meUpdateSchema,
      },
    },
    async (request, reply) => {
      if (!request.currentUser) {
        return reply.status(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication is required',
            details: null,
          },
        })
      }

      const user = await usersService.updateName(
        request.currentUser.id,
        (request.body as MeUpdateBody).name ?? null,
      )

      return {
        data: user,
      }
    },
  )
}
