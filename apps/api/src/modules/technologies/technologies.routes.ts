import type { FastifyPluginAsync } from 'fastify'

import {
  technologiesQuerySchema,
  type TechnologiesQuery,
} from './technologies.schemas.js'
import { technologiesService } from './technologies.service.js'

export const technologiesRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: TechnologiesQuery }>(
    '/api/v1/technologies',
    {
      schema: {
        querystring: technologiesQuerySchema,
      },
    },
    async (request) => {
      return technologiesService.list(request.query.categorySlug)
    },
  )
}
