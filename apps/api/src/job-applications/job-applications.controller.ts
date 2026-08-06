import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'

import { AuthGuard } from '../auth/auth.guard'
import type { AuthenticatedRequest } from '../auth/authenticated-request'
import { CreateJobApplicationDto } from './dto/create-job-application.dto'
import { ListJobApplicationsDto, ListStatusEventsDto } from './dto/list-job-applications.dto'
import { UpdateJobApplicationDto } from './dto/update-job-application.dto'
import { JobApplicationsService } from './job-applications.service'

@Controller('job-applications')
@UseGuards(AuthGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class JobApplicationsController {
  constructor(private readonly jobApplicationsService: JobApplicationsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest, @Query() query: ListJobApplicationsDto) {
    return this.jobApplicationsService.findAll(request.user.id, query)
  }

  @Get('technology-options')
  findTechnologyOptions() {
    return this.jobApplicationsService.findTechnologyOptions()
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() input: CreateJobApplicationDto) {
    return this.jobApplicationsService.create(request.user.id, input)
  }

  @Get(':id/status-events')
  findStatusEvents(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4' })) applicationId: string,
    @Query() query: ListStatusEventsDto,
  ) {
    return this.jobApplicationsService.findStatusEvents(request.user.id, applicationId, query)
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4' })) applicationId: string,
    @Body() input: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationsService.update(request.user.id, applicationId, input)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4' })) applicationId: string,
  ) {
    return this.jobApplicationsService.remove(request.user.id, applicationId)
  }
}
