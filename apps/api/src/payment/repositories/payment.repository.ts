import { InjectModel } from '@squareboat/nestjs-objection'
import { Injectable } from '@nestjs/common'
import { Repository } from '../../common/database/repository'
import { PaymentModel, PaymentStatus } from '../models/payment.model'
import { IPaymentRepository } from './payment-repository.interface'
import { UserModel } from '../../user/models/user.model'
import { PlanModel } from '../models/plan.model'
import { TransactionOrKnex } from 'objection'
import { PaymentUpdateDto } from '../dto/in/payment-update.dto'

@Injectable()
export class PaymentRepository extends Repository<PaymentModel> implements IPaymentRepository {
	@InjectModel(PaymentModel)
	model: PaymentModel

	public async createPayment(
		plan: PlanModel,
		months: number,
		user: UserModel,
		trx?: TransactionOrKnex
	): Promise<PaymentModel> {
		return PaymentModel.query(trx).insert({
			userId: user.id,
			planId: plan.id,
			amount: plan.price,
			months: months,
			status: PaymentStatus.wait
		})
	}

	public async getPayment(id: number, trx?: TransactionOrKnex): Promise<PaymentModel> {
		return PaymentModel.query(trx).findById(id)
	}

	public async getPaymentByExternalId(
		externalId: string,
		trx?: TransactionOrKnex
	): Promise<PaymentModel> {
		return PaymentModel.query(trx).where('externalId', externalId).first()
	}

	public async updatePayment(
		payment: PaymentModel,
		dto: PaymentUpdateDto,
		trx?: TransactionOrKnex
	): Promise<void> {
		await payment.$query(trx).patch(dto)
	}

	public async getHistory(userId: number): Promise<PaymentModel[]> {
		return PaymentModel.query()
			.withGraphJoined('plan')
			.where('userId', userId)
			.orderBy('dateCreated', 'DESC')
	}
}
