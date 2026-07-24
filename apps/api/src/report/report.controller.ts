import { Auth } from '../auth/decorators/auth.decorator'
import { GlobalRole } from '../user/access/enum.role'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post
} from '@nestjs/common'
import { ReportService } from './services/report.service'
import { User } from '../auth/decorators/user.decorator'
import { UserModel } from '../user/models/user.model'
import { ProjectAuthService } from '../project/auth/project-auth.service'
import { UUID } from 'crypto'
import { Mapper } from '@automapper/core'
import { InjectMapper } from '@automapper/nestjs'
import { ReportDto } from './dto/dto/report.dto'
import { ReportModel } from './models/report.model'
import { GenerateReportRequest, GenerateReportResponse } from './dto'

@Auth(GlobalRole.User)
@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly projectAuthService: ProjectAuthService,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  @ApiOperation({
    summary: 'Generate task report'
  })
  @ApiOkResponse({
    type: GenerateReportResponse
  })
  @Post('/project/:projectId/task-execution')
  async generateTaskExecutionReport(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() generateReportRequest: GenerateReportRequest,
    @User() user: UserModel
  ): Promise<GenerateReportResponse> {
    if (!(await this.projectAuthService.canGenerateReports(user, projectId))) {
      throw new ForbiddenException('You do not have permission to generate reports')
    }

    const report = await this.reportService.generateTaskExecutionReport(
      projectId,
      generateReportRequest,
      user.id
    )

    return { id: report.id, uuid: report.uuid }
  }

  @Get('/project/:projectId/task-execution/:uuid')
  async getTaskExecutionReport(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('uuid', ParseUUIDPipe) uuid: UUID,
    @User() user: UserModel
  ) {
    const report = await this.reportService.getByUUID(uuid)

    if (!report) {
      throw new NotFoundException('Report not found: ' + uuid)
    }

    if (
      report.userId !== user.id &&
      !(await this.projectAuthService.canGenerateReports(user, projectId))
    ) {
      throw new ForbiddenException('You do not have permission to get this report')
    }

    return this.mapper.map(report, ReportModel, ReportDto)
  }

  @Delete('/project/:projectId/:uuid')
  async deleteReport(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('uuid', ParseUUIDPipe) uuid: UUID,
    @User() user: UserModel
  ) {
    const report = await this.reportService.getByUUID(uuid)

    if (!report) {
      throw new NotFoundException('Report not found: ' + uuid)
    }

    if (
      report.userId !== user.id &&
      !(await this.projectAuthService.canDeleteReports(user, projectId))
    ) {
      throw new ForbiddenException('You do not have permission to delete this report')
    }

    await this.reportService.deleteReport(report)
  }
}
