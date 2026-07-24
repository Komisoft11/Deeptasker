import { Injectable } from '@nestjs/common'
import { Repository } from '../../common/database/repository'
import { InjectModel } from '@squareboat/nestjs-objection'
import { ReportModel, ReportStatus } from '../models/report.model'
import { IReportRepository } from './report-repository.interface'
import { randomUUID, UUID } from 'crypto'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { ReportCreateDto } from '../dto/dto/report-create.dto'
import { ref, TransactionOrKnex } from 'objection'

@Injectable()
export class ReportRepository extends Repository<ReportModel> implements IReportRepository {
	@InjectModel(ReportModel)
	model: ReportModel

	public async createReport(dto: ReportCreateDto): Promise<ReportModel> {
		return ReportModel.query().insert({
			title: dto.title,
			userId: dto.userId,
			projectId: dto.projectId,
			periodStart: dto.periodStart,
			periodEnd: dto.periodEnd,
			uuid: randomUUID(),
			status: ReportStatus.Pending
		})
	}

	public async deleteReport(uuid: UUID, trx?: TransactionOrKnex): Promise<void> {
		await ReportModel.query(trx).where('uuid', uuid).first().delete()
	}

	public async getProjectReportsByUserId(userId: number): Promise<ReportModel[]> {
		return ReportModel.query()
			.where('userId', userId)
			.orderBy('status', 'desc')
			.orderBy('dateCreated', 'desc')
	}

	public async getProjectReports(projectId: number): Promise<ReportModel[]> {
		return ReportModel.query()
			.where('projectId', projectId)
			.withGraphJoined('file')
			.modifyGraph('file', builder => {
				builder.select(ref('filePath'))
			})
			.orderBy('dateCreated', 'desc')
	}

	public async getByUUID(uuid: UUID): Promise<ReportModel> {
		return ReportModel.query().where('uuid', uuid).first()
	}

	public async updateReportStatus(
		report: ReportModel,
		status: ReportStatus,
		fileId?: number,
		errorMessage?: string
	) {
		await report.$query().patch({
			status,
			fileId,
			error: errorMessage,
			dateCompleted: status === ReportStatus.Completed ? getCurrentUTCDateTime() : undefined
		})
	}

	public async getReportWithFile(reportId: number): Promise<ReportModel> {
		return ReportModel.query().alias('r').where('r.id', reportId).first().withGraphJoined('file')
	}

	public async getReport(reportId: number): Promise<ReportModel> {
		return ReportModel.query().findOne({ id: reportId })
	}
}
