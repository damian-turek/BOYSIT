import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DashboardModule } from './dashboard/dashboard.module'
import { HealthModule } from './health/health.module'
import { JobApplicationsModule } from './job-applications/job-applications.module'
import { LibraryModule } from './library/library.module'
import { PrismaModule } from './prisma/prisma.module'
import { QuestionsModule } from './questions/questions.module'
import { StripeModule } from './stripe/stripe.module'
import { UserModule } from './users/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    QuestionsModule,
    UserModule,
    JobApplicationsModule,
    StripeModule,
    LibraryModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
