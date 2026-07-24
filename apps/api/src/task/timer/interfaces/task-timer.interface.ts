import { IReportFields } from '../../../report/interfaces/report.interface'

export interface ITaskTimerQueryOptions {
	projectId: number
	startDate: Date
	endDate: Date
	fields?: IReportFields
}
