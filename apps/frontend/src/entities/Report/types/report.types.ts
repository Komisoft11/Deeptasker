import { ReportStatus } from '@/entities/Report/model/const/report-statuses'

export type ReportFormat = 'csv' | 'xlsx' | 'xls'
export type IReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus]

export interface IProjectReport {
  id: number
  uuid: string
  title: string
  status: IReportStatus
  periodStart: Date
  periodEnd: Date
  fileId: number
  file: {
    filePath: string
  }
  dateDeleted?: Date
  dateCreated?: Date
}

export interface ReportFields {
  description?: boolean
  dateCreated?: boolean
  dateExecuted?: boolean
  sprint?: boolean
  timeExpired?: boolean
  executor?: boolean
  assigner?: boolean
  observers?: boolean
  fileLinks?: boolean
  tags?: boolean
  dateDeadline?: boolean
  timeEstimate?: boolean
  spentTime?: boolean
  status?: boolean
  taskId?: boolean
  name?: boolean
  creator?: boolean
}

export interface IProjectReportDTO {
  periodStart: Date
  periodEnd: Date
  format: ReportFormat
  title: string
  statuses: number[]
  fields: ReportFields
}
