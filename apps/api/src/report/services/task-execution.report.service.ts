import { Inject, Injectable } from '@nestjs/common'
import { TaskModel } from '../../task/models/task.model'
import { ReportModel, ReportStatus } from '../models/report.model'
import * as XLSX from 'xlsx'
import { FileService } from '../../file/services/file.service'
import { FileModel } from '../../file/models/file.model'
import { BufferedFile } from '../../file/interfaces/buffered-file.interface'
import { IReportRepository, REPORT_REPOSITORY } from '../repositories/report-repository.interface'
import {
  FileReportFormat,
  IReportFields,
  ITaskExecutionReportRequestData
} from '../interfaces/report.interface'
import { UserModel } from '../../user/models/user.model'
import { TagModel } from '../../task/tag/models/tag.model'
import {
  ITaskRepository,
  TASK_REPOSITORY
} from '../../task/repositories/task/task-repository.interface'
import { TaskTimerModel } from '../../task/timer/models/task-timer.model'
import striptags from 'striptags'
import { I18nService } from 'nestjs-i18n'
import { TaskStatusModel } from '../../task/models/task-status.model'
import { EventService } from '../../events/event.service'
import { UUID } from 'crypto'
import { DateDiff } from '../../common/helpers/date-diff'
import { ProjectCacheService } from '../../cache/services/project.cache-service'

type IRow = Partial<Record<keyof IReportFields, string>> & {
  id: number
}

@Injectable()
export class TaskExecutionReportService {
  private static readonly HEADERS: Record<keyof IReportFields, string> = {
    taskId: 'report.header_id',
    name: 'report.header_name',
    description: 'report.header_description',
    creator: 'report.header_creator',
    dateCreated: 'report.header_date_created',
    dateExecuted: 'report.header_date_executed',
    sprint: 'report.header_sprint',
    timeExpired: 'report.header_time_expired',
    executor: 'report.header_executor',
    spentTime: 'report.header_spent_time',
    assigner: 'report.header_assigner',
    observers: 'report.header_observers',
    fileLinks: 'report.header_file_links',
    tags: 'report.header_tags',
    dateDeadline: 'report.header_date_deadline',
    timeEstimate: 'report.header_time_estimate',
    status: 'report.header_status'
  }

  constructor(
    private readonly fileService: FileService,
    private readonly i18n: I18nService,
    private eventService: EventService,
    @Inject(REPORT_REPOSITORY) private readonly reportRepository: IReportRepository,
    @Inject(TASK_REPOSITORY) private readonly taskRepository: ITaskRepository,
    private readonly projectCacheService: ProjectCacheService
  ) {}

  public async create(reportRequest: ITaskExecutionReportRequestData): Promise<void> {
    const report = await this.reportRepository.getByUUID(reportRequest.uuid as UUID)

    this.eventService
      .sendEvent({
        userId: report.userId,
        isOrigin: true,
        project: {
          id: report.projectId,
          report: {
            id: report.id,
            status: ReportStatus.InProgress,
            title: report.title,
            uuid: report.uuid
          }
        }
      })
      .catch(e => {
        console.error(e)
      })

    try {
      const tasks = await this.taskRepository.getTasksWithReportFields(reportRequest)

      await this.reportRepository.updateReportStatus(report, ReportStatus.InProgress)

      const headers = this.getHeaders(reportRequest)
      const rows = this.buildRows(tasks, reportRequest)

      const fileBuffer = await this.createFileReport(rows, headers, reportRequest.format)
      const file = await this.saveFile(report, fileBuffer, reportRequest.format)

      await this.reportRepository.updateReportStatus(report, ReportStatus.Completed, file.id)

      await this.projectCacheService.deleteReports(report.projectId)

      this.eventService
        .sendEvent({
          userId: reportRequest.userId,
          isOrigin: true,
          project: {
            id: reportRequest.projectId,
            report: {
              id: report.id,
              fileUrl: file.filePath,
              status: ReportStatus.Completed,
              title: report.title
            }
          }
        })
        .catch(e => {
          console.error(e)
        })
    } catch (error) {
      console.error(error)
      await this.reportRepository.updateReportStatus(
        report,
        ReportStatus.Error,
        null,
        error.message
      )
      this.eventService
        .sendEvent({
          userId: reportRequest.userId,
          isOrigin: true,
          project: {
            id: reportRequest.projectId,
            report: { id: report.id, status: ReportStatus.Error, title: report.title }
          }
        })
        .catch(e => {
          console.error(e)
        })
      throw error
    }
  }

  private buildRow(
    task: TaskModel,
    reportRequest: ITaskExecutionReportRequestData,
    timer: TaskTimerModel = null
  ): IRow {
    const row: IRow = { id: task.id }

    const { fields, lang } = reportRequest

    for (const key of Object.keys(TaskExecutionReportService.HEADERS) as Array<
      keyof IReportFields
    >) {
      if (fields[key]) {
        switch (key) {
          case 'taskId':
            row.taskId = task.id.toString()
            break
          case 'name':
            row.name = task.title
            break
          case 'description':
            row.description = this.getDescription(task.content)
            break
          case 'creator':
            row.creator = this.getUserFullName(task.user)
            break
          case 'dateCreated':
            row.dateCreated = task.dateCreated?.toDateString() ?? ''
            break
          case 'dateExecuted':
            row.dateExecuted = task.dateFinished?.toDateString() ?? ''
            break
          case 'sprint':
            row.sprint = 'Sprint does not exist'
            break
          case 'executor':
            row.executor = this.getUserFullName(timer?.user ?? task.executor)
            break
          case 'assigner':
            row.assigner = this.getUserFullName(task.assigner)
            break
          case 'observers':
            row.observers =
              task?.invited.map(record => this.getUserFullName(record.user)).join(', ') ?? ''
            break
          case 'fileLinks':
            row.fileLinks = this.joinFilePaths(task.files)
            break
          case 'tags':
            row.tags = this.joinTags(task.tags)
            break
          case 'dateDeadline':
            row.dateDeadline = task.deadlineDate?.toDateString() ?? ''
            break
          case 'timeEstimate':
            row.timeEstimate = this.formatTime(task.estimatedTime)
            break
          case 'spentTime':
            row.spentTime = this.formatTime(timer?.seconds ?? 0)
            break
          case 'timeExpired':
            row.timeExpired = this.getDaysExpired(task).toFixed(1)
            break
          case 'status':
            row.status = this.translateStatus(task.status, lang)

            break
          default:
            break
        }
      }
    }

    return row
  }

  private buildRows(tasks: TaskModel[], reportRequest: ITaskExecutionReportRequestData): IRow[] {
    const rows: IRow[] = []

    if (!tasks.length) {
      return rows
    }

    tasks.forEach(task => {
      const hasTimers = task.timers?.length > 0

      if (hasTimers) {
        task.timers.forEach(timer => {
          rows.push(this.buildRow(task, reportRequest, timer))
        })
      } else {
        rows.push(this.buildRow(task, reportRequest))
      }
    })

    return rows
  }

  private getHeaders(reportRequest: ITaskExecutionReportRequestData): string[] {
    if (!this.hasActiveFields(reportRequest)) return []
    return Object.entries(TaskExecutionReportService.HEADERS)
      .filter(([key]) => reportRequest.fields[key])
      .map(([_, value]) => this.i18n.t(value, { lang: reportRequest.lang ?? 'en' }))
  }

  private async createFileReport(rows: IRow[], headers: string[], format: FileReportFormat) {
    const ROW_HEIGHT = 20
    const CELL_MARGIN = 3

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet([])

    const sortedRows = rows.sort((a, b) => a.id - b.id)

    const xlsxSortedRows = sortedRows.map(({ id, ...xlsxRow }) => xlsxRow)

    worksheet['!merges'] = sortedRows.reduce((merges, row, rowIndex) => {
      // { s: { c: 0, r: 0 }, e: { c: 1, r: 0 } } // Объединяет ячейки A1 и B1

      const lastIndexSameRow = this.getLastIndexSameRow(sortedRows, r => r.id === row.id)

      if (lastIndexSameRow === rowIndex) {
        return merges
      }

      Object.keys(row).forEach((key, cellIndex) => {
        if (row[key] === sortedRows[lastIndexSameRow][key]) {
          merges.push({
            s: { c: cellIndex - 1, r: rowIndex + 1 },
            e: { c: cellIndex - 1, r: lastIndexSameRow + 1 }
          })
        }
      })

      return merges
    }, [])

    worksheet['!cols'] = headers.map((value, index) => {
      if (xlsxSortedRows.length === 0) {
        return { wch: value.length + 3 }
      }

      const maxColumnLength = Math.max(
        value.length,
        ...xlsxSortedRows.map(row => {
          const cellValue = Object.values(row)[index]
          return cellValue ? cellValue.toString().length : 0
        })
      )

      const columnWidth = maxColumnLength > value.length ? maxColumnLength : value.length

      return { wch: columnWidth + CELL_MARGIN }
    })

    worksheet['!rows'] = new Array(xlsxSortedRows.length + 1).fill({ hpx: ROW_HEIGHT })

    XLSX.utils.sheet_add_aoa(worksheet, [headers])
    XLSX.utils.sheet_add_json(worksheet, xlsxSortedRows, {
      origin: 'A2',
      skipHeader: true
    })

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    return XLSX.write(workbook, { type: 'buffer', bookType: format })
  }

  private async saveFile(
    report: ReportModel,
    fileBuffer: BufferedFile,
    extension: FileReportFormat
  ): Promise<FileModel> {
    return this.fileService.upload(
      {
        file: fileBuffer,
        filename: `task-execution-report-${report.id}.${extension}`,
        customName: `Report_${new Date().toLocaleDateString()}.${extension}`
      },
      `report/${report.id}`,
      report.userId
    )
  }

  private formatTime(seconds: number = 0): string {
    if (seconds >= 86400) {
      return (seconds / 86400).toFixed(0) + ' d'
    }

    if (seconds >= 3600) {
      return (seconds / 3600).toFixed(0) + ' h'
    }

    if (seconds >= 60) {
      return (seconds / 60).toFixed(0) + ' m'
    }

    return seconds ? `${seconds} s` : '0 s'
  }

  private getUserFullName(user?: UserModel): string {
    return user ? `${user.firstName} ${user.lastName}` : ''
  }

  private joinFilePaths(files?: FileModel[]): string {
    return files ? files.map(file => file.filePath).join(', ') : ''
  }

  private joinTags(tags?: TagModel[]): string {
    return tags ? tags.map(tag => tag.name).join(', ') : ''
  }

  private getDaysExpired(task: TaskModel): number {
    return task.deadlineDate && task.dateFinished && task.dateFinished > task.deadlineDate
      ? new DateDiff(task.deadlineDate, task.dateFinished).days()
      : 0
  }

  private hasActiveFields(reportRequest: ITaskExecutionReportRequestData): boolean {
    return Object.values(reportRequest.fields || {}).some(Boolean)
  }

  private getDescription(content: string = '') {
    return striptags(content)
  }

  private getLastIndexSameRow<T>(
    array: T[],
    predicate: (value: T, index: number, array: T[]) => boolean
  ): number {
    for (let i = array.length - 1; i >= 0; i--) {
      if (predicate(array[i], i, array)) {
        return i
      }
    }
    return -1
  }

  private translateStatus(status: TaskStatusModel, lang = 'en'): string {
    if (!status?.name) {
      return ''
    }

    if (status.code) {
      return this.i18n.t(`task_status.${status.code}`, { lang })
    }

    return status.name
  }
}
