import 'dotenv/config'

type NodeEnv = 'development' | 'test' | 'production'

export type Env = {
  NODE_ENV: NodeEnv
  PORT: number
  CORS_ORIGIN: string
}

const validNodeEnvs = new Set<NodeEnv>(['development', 'test', 'production'])

function parsePort(value: string | undefined): number {
  if (!value) {
    return 4000
  }

  const port = Number(value)

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid TCP port')
  }

  return port
}

function parseNodeEnv(value: string | undefined): NodeEnv {
  const nodeEnv = value ?? 'development'

  if (!validNodeEnvs.has(nodeEnv as NodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production')
  }

  return nodeEnv as NodeEnv
}

export const env: Env = {
  NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
  PORT: parsePort(process.env.PORT),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
}
