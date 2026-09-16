import { Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common'

import { AuthGuard } from '../auth/auth.guard'
import type { AuthenticatedRequest } from '../auth/authenticated-request'
import { LibraryService } from './library.service'

@Controller()
@UseGuards(AuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('library')
  getLibrary(@Req() request: AuthenticatedRequest) {
    return this.libraryService.getLibrary(request.user.id, request.user.plan)
  }

  @Post('bookmarks/:questionId')
  toggleBookmark(
    @Req() request: AuthenticatedRequest,
    @Param('questionId', new ParseUUIDPipe({ version: '4' })) questionId: string,
  ) {
    return this.libraryService.toggleBookmark(request.user.id, questionId)
  }
}
