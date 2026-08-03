import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import type { DatabaseClient } from 'database'

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('PRISMA_INSTANCE') public readonly client: DatabaseClient) {}

  async onModuleInit() {
    await this.client.$connect()
  }

  async onModuleDestroy() {
    await this.client.$disconnect()
  }
}
