import { AutoMap } from '@automapper/classes'
import { ReportStatus } from '../../models/report.model'

export class ReportDto {
	@AutoMap()
	id: number

	@AutoMap()
	uuid: string

	@AutoMap()
	title: string

	@AutoMap()
	status: ReportStatus

	@AutoMap()
	periodStart: Date

	@AutoMap()
	periodEnd: Date
}
