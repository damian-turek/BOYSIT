import { Module, Global } from '@nestjs/common'
import { prisma } from 'database'
import { PrismaService } from './prisma.service'

@Global()
@Module({
  providers: [
    {
      provide: 'PRISMA_INSTANCE',
      useValue: prisma,
    },
    PrismaService,
  ],
  exports: [PrismaService],
})
export class PrismaModule {}