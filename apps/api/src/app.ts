import Fastify from 'fastify'

import { corsPlugin } from './plugins/cors.js'
import { registerErrorHandlers } from './plugins/errors.js'
import { securityPlugin } from './plugins/security.js'
import { healthRoutes } from './modules/health/health.routes.js'

export function buildApp() {
  const app = Fastify({
    logger: true,
  })

  registerErrorHandlers(app)

  void app.register(securityPlugin)
  void app.register(corsPlugin)
  void app.register(healthRoutes)

  return app
}
