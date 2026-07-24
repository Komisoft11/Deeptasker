import { Inject, Injectable } from '@nestjs/common'
import { ReportProducer } from '../../async-job/report/report.producer'
import { ReportModel } from '../models/report.model'
import { IReportRepository, REPORT_REPOSITORY } from '../repositories/report-repository.interface'
import { ITaskExecutionReportRequestData } from '../interfaces/report.interface'
import { I18nContext } from 'nestjs-i18n'
import { UUID } from 'crypto'
import { MyBaseModel } from '../../common/database/base.model'
import { FileService } from '../../file/services/file.service'
import { EventService } from '../../events/event.service'
import { ReportDto } from '../dto/dto/report.dto'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { ProjectCacheService } from '../../cache/services/project.cache-service'
import { GenerateReportRequest } from '../dto'
import { getCurrentUTCDateTime } from '../../common/helpers/date'

@Injectable()
export class ReportService {
  constructor(
    private readonly reportProducer: ReportProducer,
    private readonly fileService: FileService,
    private eventService: EventService,
    @Inject(REPORT_REPOSITORY) private readonly reportRepository: IReportRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly projectCacheService: ProjectCacheService
  ) {}

  public async generateTaskExecutionReport(
    projectId: number,
    dto: GenerateReportRequest,
    userId: number
  ): Promise<ReportModel> {
    const lang = I18nContext.current().lang

    try {
      const report = await this.reportRepository.createReport({
        ...dto,
        projectId,
        userId
      })

      await this.projectCacheService.deleteReports(projectId)

      const reportRequestData: ITaskExecutionReportRequestData = {
        projectId,
        userId,
        uuid: report.uuid,
        lang,
        ...dto
      }

      await this.reportProducer.generateTaskExecutionReportFile(reportRequestData)

      this.eventService
        .sendEvent({
          userId: report.userId,
          project: {
            id: report.projectId,
            report: {
              id: report.id,
              title: report.title,
              dateCreated: getCurrentUTCDateTime(),
              uuid: report.uuid
            }
          }
        })
        .then()
        .catch(e => {
          console.error(e)
        })

      return report
    } catch (e) {
      throw e
    }
  }

  public async getByUUID(uuid: UUID): Promise<ReportModel> {
    return this.reportRepository.getByUUID(uuid)
  }

  public async getProjectReports(projectId: number): Promise<ReportDto[]> {
    const cached = await this.projectCacheService.getReports(projectId)

    if (cached) {
      return cached
    }

    const reports = await this.reportRepository.getProjectReports(projectId)

    const dto = this.mapper.mapArray(reports, ReportModel, ReportDto)

    await this.projectCacheService.setReports(projectId, dto)

    return dto
  }

  public async getReportWithFile(reportId: number): Promise<ReportModel> {
    return this.reportRepository.getReportWithFile(reportId)
  }

  public async deleteReport(report: ReportModel): Promise<void> {
    const trx = await MyBaseModel.startTransaction()

    try {
      if (report?.fileId) {
        await this.fileService.delete(report.fileId, trx)
      }

      await this.reportRepository.deleteReport(report.uuid, trx)

      await trx.commit()

      await this.projectCacheService.deleteReports(report.projectId)

      this.eventService
        .sendEvent({
          userId: report.userId,
          project: {
            id: report.projectId,
            report: {
              id: report.id,
              title: report.title,
              dateDeleted: getCurrentUTCDateTime(),
              uuid: report.uuid
            }
          }
        })
        .then()
        .catch(e => {
          console.error(e)
        })
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }
}
