import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const ignoredWorkspacePaths = [
  '**/.next/**',
  '**/node_modules/**',
  '../../packages/database/generated/**',
  '../../packages/database/dist/**',
  '../../apps/api/dist/**',
  '../../apps/cms/.next/**',
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingExcludes: {
    '*': ignoredWorkspacePaths,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ignoredWorkspacePaths,
      }
    }

    return config
  },
}

export default withNextIntl(nextConfig)
