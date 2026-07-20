import { Inject, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { DatabaseClient } from 'database'

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