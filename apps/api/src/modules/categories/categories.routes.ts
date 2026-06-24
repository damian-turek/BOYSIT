import type { FastifyPluginAsync } from 'fastify'

import { categoriesService } from './categories.service.js'

export const categoriesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/v1/categories', async () => {
    return categoriesService.list()
  })
}
