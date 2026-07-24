import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { ReportModel, ReportStatus } from '../models/report.model'
import { ReportCreateDto } from '../dto/dto/report-create.dto'
import { UUID } from 'crypto'
import { TransactionOrKnex } from 'objection'

export const REPORT_REPOSITORY = 'report_repository'

export interface IReportRepository extends RepositoryContract<ReportModel> {
	query<R = ReportModel>(): CustomQueryBuilder<ReportModel, R>

	createReport(dto: ReportCreateDto): Promise<ReportModel>

	deleteReport(uuid: string, trx?: TransactionOrKnex): Promise<void>

	getProjectReportsByUserId(userId: number): Promise<ReportModel[]>

	getProjectReports(projectId: number): Promise<ReportModel[]>

	getByUUID(uuid: UUID): Promise<ReportModel>

	updateReportStatus(
		report: ReportModel,
		status: ReportStatus,
		fileId?: number,
		errorMessage?: string
	): Promise<void>

	getReport(reportId: number): Promise<ReportModel>

	getReportWithFile(reportId: number): Promise<ReportModel>
}
