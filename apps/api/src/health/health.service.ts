import { Injectable, ServiceUnavailableException } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'

export type LivenessResponse = {
  status: 'ok'
  service: 'api'
}

export type ReadinessResponse = {
  status: 'ready'
  checks: {
    database: 'up'
  }
}

@Injectable()
export class HealthService {
  constructor(private readonly prismaService: PrismaService) {}

  getLiveness(): LivenessResponse {
    return {
      status: 'ok',
      service: 'api',
    }
  }

  async getReadiness(): Promise<ReadinessResponse> {
    try {
      await this.prismaService.client.$queryRaw`SELECT 1`

      return {
        status: 'ready',
        checks: {
          database: 'up',
        },
      }
    } catch {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        checks: {
          database: 'down',
        },
      })
    }
  }
}
