import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const securityPluginCallback: FastifyPluginAsync = async (app) => {
  await app.register(helmet)
  await app.register(sensible)
}

export const securityPlugin = fp(securityPluginCallback, {
  name: 'security-plugin',
})
