import { type ExecutionContext, UnauthorizedException } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
import { createServerClient } from '@supabase/ssr'
import type { User } from 'database'
import type { FastifyRequest } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { AuthGuard } from './auth.guard'
import type { AuthenticatingRequest } from './authenticated-request'

vi.mock('@supabase/ssr', async () => {
  const actual = await vi.importActual<typeof import('@supabase/ssr')>('@supabase/ssr')

  return {
    ...actual,
    createServerClient: vi.fn(),
  }
})

const databaseUser: User = {
  id: '5bf4e958-1555-40cd-a8de-f8f6641ab4f1',
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  authProviderId: 'auth-user-id',
  plan: 'free',
  proUntil: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

const supabaseUser = {
  id: 'auth-user-id',
  email: databaseUser.email,
  user_metadata: { name: databaseUser.name },
}

const createRequest = (headers: FastifyRequest['headers'] = {}): AuthenticatingRequest =>
  ({
    headers,
    raw: { headers },
  }) as AuthenticatingRequest

const createContext = (request: AuthenticatingRequest): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => function handler() {},
    getClass: () => class TestController {},
  }) as unknown as ExecutionContext

describe('AuthGuard', () => {
  const getUser = vi.fn()
  const findUnique = vi.fn()
  const create = vi.fn()
  const update = vi.fn()
  const getAllAndOverride = vi.fn()

  const prismaService = {
    client: {
      user: {
        findUnique,
        create,
        update,
      },
    },
  } as unknown as PrismaService

  const reflector = {
    getAllAndOverride,
  } as unknown as Reflector

  let guard: AuthGuard

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('SUPABASE_ANON_KEY', 'test-anon-key')

    vi.mocked(createServerClient).mockReturnValue({ auth: { getUser } } as never)
    getUser.mockResolvedValue({ data: { user: supabaseUser }, error: null })
    findUnique.mockResolvedValue(databaseUser)
    getAllAndOverride.mockReturnValue(undefined)
    guard = new AuthGuard(prismaService, reflector)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('authenticates a cookie request and attaches the synchronized database user', async () => {
    const request = createRequest({ cookie: 'session=cookie-token' })

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true)

    expect(getUser).toHaveBeenCalledWith()
    expect(request.user).toBe(databaseUser)

    const clientOptions = vi.mocked(createServerClient).mock.calls[0]?.[2]
    expect(clientOptions?.cookies.getAll()).toEqual([{ name: 'session', value: 'cookie-token' }])
  })

  it('passes a Bearer token directly to Supabase verification', async () => {
    const request = createRequest({
      authorization: 'Bearer access-token',
      cookie: 'session=stale-cookie-token',
    })

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true)

    expect(getUser).toHaveBeenCalledWith('access-token')
    expect(request.user).toBe(databaseUser)
  })

  it('rejects a missing or invalid Supabase session before database access', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid session' },
    })

    await expect(guard.canActivate(createContext(createRequest()))).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
    expect(findUnique).not.toHaveBeenCalled()
  })

  it('creates the application user from narrowed Supabase metadata', async () => {
    findUnique.mockResolvedValue(null)
    create.mockResolvedValue(databaseUser)

    const request = createRequest({ authorization: 'Bearer access-token' })

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true)

    expect(create).toHaveBeenCalledWith({
      data: {
        authProviderId: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata.name,
      },
    })
  })

  it('rejects an authenticated user whose plan is not allowed', async () => {
    getAllAndOverride.mockReturnValue(['pro'])

    await expect(guard.canActivate(createContext(createRequest()))).rejects.toMatchObject({
      message: 'Access denied',
    })
  })
})
