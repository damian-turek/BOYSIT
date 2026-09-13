import { Controller, Get, Req, UseGuards } from '@nestjs/common'

import { AuthGuard } from '../auth/auth.guard'
import type { AuthenticatedRequest } from '../auth/authenticated-request'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview(@Req() request: AuthenticatedRequest) {
    return this.dashboardService.getOverview(request.user.id)
  }
}
