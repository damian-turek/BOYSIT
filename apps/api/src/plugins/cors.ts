import cors from '@fastify/cors'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

import { env } from '../config/env.js'

const corsPluginCallback: FastifyPluginAsync = async (app) => {
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
}

export const corsPlugin = fp(corsPluginCallback, {
  name: 'cors-plugin',
})
