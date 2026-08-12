import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ExamsModule } from './exams/exams.module'
import { HealthModule } from './health/health.module'
import { JobApplicationsModule } from './job-applications/job-applications.module'
import { PrismaModule } from './prisma/prisma.module'
import { QuestionsModule } from './questions/questions.module'
import { UserModule } from './users/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    ExamsModule,
    QuestionsModule,
    UserModule,
    JobApplicationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
