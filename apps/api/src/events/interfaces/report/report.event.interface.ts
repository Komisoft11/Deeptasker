import { ReportStatus } from '../../../report/models/report.model'

export interface IReportEvent {
  id: number
  fileUrl?: string
  status?: ReportStatus
  title: string
  dateCreated?: Date
  dateDeleted?: Date
  uuid?: string
}
