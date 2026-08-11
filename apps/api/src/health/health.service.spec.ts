import { ServiceUnavailableException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'

describe('HealthService', () => {
  const queryRaw = vi.fn()
  const prismaService = {
    client: {
      $queryRaw: queryRaw,
    },
  } as unknown as PrismaService

  let controller: HealthController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new HealthController(new HealthService(prismaService))
  })

  it('reports liveness without querying the database', () => {
    expect(controller.getLiveness()).toEqual({
      status: 'ok',
      service: 'api',
    })
    expect(queryRaw).not.toHaveBeenCalled()
  })

  it('reports readiness when the database responds', async () => {
    queryRaw.mockResolvedValueOnce([{ '?column?': 1 }])

    await expect(controller.getReadiness()).resolves.toEqual({
      status: 'ready',
      checks: {
        database: 'up',
      },
    })
    expect(queryRaw).toHaveBeenCalledOnce()
  })

  it('returns a controlled service-unavailable response when the database is down', async () => {
    const internalError = 'connection failed for postgresql://user:secret@example.com/database'
    queryRaw.mockRejectedValueOnce(new Error(internalError))

    let caughtError: unknown
    try {
      await controller.getReadiness()
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).toBeInstanceOf(ServiceUnavailableException)
    expect(caughtError).toMatchObject({
      status: 503,
      response: {
        status: 'not_ready',
        checks: {
          database: 'down',
        },
      },
    })
    expect(JSON.stringify(caughtError)).not.toContain(internalError)
  })
})
