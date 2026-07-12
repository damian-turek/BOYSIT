import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { DatabaseClient, prisma } from 'database/dist/src'

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly client: DatabaseClient = prisma

  async onModuleInit() {
   await this.client.$connect()
  }

  async onModuleDestroy() {
    await this.client.$disconnect()
  }
}