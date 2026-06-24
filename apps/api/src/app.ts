import Fastify from 'fastify'

import { categoriesRoutes } from './modules/categories/categories.routes.js'
import { corsPlugin } from './plugins/cors.js'
import { registerErrorHandlers } from './plugins/errors.js'
import { securityPlugin } from './plugins/security.js'
import { healthRoutes } from './modules/health/health.routes.js'
import { questionsRoutes } from './modules/questions/questions.routes.js'
import { tagsRoutes } from './modules/tags/tags.routes.js'
import { technologiesRoutes } from './modules/technologies/technologies.routes.js'

export function buildApp() {
  const app = Fastify({
    logger: true,
  })

  registerErrorHandlers(app)

  void app.register(securityPlugin)
  void app.register(corsPlugin)
  void app.register(healthRoutes)
  void app.register(categoriesRoutes)
  void app.register(technologiesRoutes)
  void app.register(tagsRoutes)
  void app.register(questionsRoutes)

  return app
}
