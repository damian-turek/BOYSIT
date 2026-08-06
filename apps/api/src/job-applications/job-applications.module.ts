import { Module } from '@nestjs/common'

import { JobApplicationsController } from './job-applications.controller'
import { JobApplicationsService } from './job-applications.service'

@Module({
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
})
export class JobApplicationsModule {}
