import { spawn, spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline'

const apiKey = process.env.STRIPE_SECRET_KEY
if (!/^(sk|rk)_test_/.test(apiKey ?? '')) {
  throw new Error('Local webhook forwarding requires a test STRIPE_SECRET_KEY in apps/api/.env')
}

const env = { ...process.env, STRIPE_API_KEY: apiKey }
const result = spawnSync('stripe', ['listen', '--print-secret'], {
  env,
  encoding: 'utf8',
  timeout: 30_000,
})
const signingSecret = result.stdout?.match(/whsec_[A-Za-z0-9]+/)?.[0]
if (result.status !== 0 || !signingSecret) {
  throw new Error(
    'Could not initialize Stripe CLI. Check your test API key and network connection.',
  )
}
if (signingSecret !== process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error(
    'STRIPE_WEBHOOK_SECRET does not match this listener. Run stripe listen --print-secret with the same test key, update apps/api/.env, and restart the API.',
  )
}

const events = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]
const port = process.env.PORT ?? '4000'
const listener = spawn(
  'stripe',
  [
    'listen',
    '--events',
    events.join(','),
    '--forward-to',
    `http://localhost:${port}/api/v1/stripe/webhook`,
  ],
  { env, stdio: ['ignore', 'pipe', 'pipe'] },
)

for (const stream of [listener.stdout, listener.stderr]) {
  createInterface({ input: stream }).on('line', (line) => {
    console.log(line.replace(/whsec_[A-Za-z0-9]+/g, '[signing secret redacted]'))
  })
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => listener.kill(signal))
}
listener.on('error', () => {
  console.error('Stripe CLI could not start. Run pnpm install and retry.')
  process.exitCode = 1
})
listener.on('exit', (code) => process.exit(code ?? 1))
