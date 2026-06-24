import type { FastifyPluginAsync } from 'fastify'

import { tagsService } from './tags.service.js'

export const tagsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/v1/tags', async () => {
    return tagsService.list()
  })
}
