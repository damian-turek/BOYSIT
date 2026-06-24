import Fastify from 'fastify'

import { corsPlugin } from './plugins/cors.js'
import { registerErrorHandlers } from './plugins/errors.js'
import { authPlugin } from './plugins/auth.js'
import { securityPlugin } from './plugins/security.js'
import { healthRoutes } from './modules/health/health.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'

export function buildApp() {
  const app = Fastify({
    logger: true,
  })

  registerErrorHandlers(app)

  void app.register(securityPlugin)
  void app.register(corsPlugin)
  void app.register(authPlugin)
  void app.register(healthRoutes)
  void app.register(usersRoutes)

  return app
}
