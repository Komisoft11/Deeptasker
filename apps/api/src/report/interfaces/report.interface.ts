import { GenerateReportRequest } from '../dto'

export interface IReportFields {
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

export type ITaskExecutionReportFieldsMap = { [K in keyof IReportFields]: string }

export type FileReportFormat = 'csv' | 'xls' | 'xlsx'

export interface ITaskExecutionReportRequestData extends GenerateReportRequest {
  uuid: string
  userId: number
  projectId: number
  lang?: string
}
