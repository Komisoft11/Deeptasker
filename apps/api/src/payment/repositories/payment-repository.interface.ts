import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { PaymentModel } from '../models/payment.model'
import { PlanModel } from '../models/plan.model'
import { UserModel } from '../../user/models/user.model'
import { TransactionOrKnex } from 'objection'
import { PaymentUpdateDto } from '../dto/in/payment-update.dto'

export const PAYMENT_REPOSITORY = 'payment_repository'

export interface IPaymentRepository extends RepositoryContract<PaymentModel> {
	query<R = PaymentModel>(): CustomQueryBuilder<PaymentModel, R>

	createPayment(
		plan: PlanModel,
		months: number,
		user: UserModel,
		trx?: TransactionOrKnex
	): Promise<PaymentModel>

	getPayment(id: number, trx?: TransactionOrKnex): Promise<PaymentModel>

	getPaymentByExternalId(externalId: string, trx?: TransactionOrKnex): Promise<PaymentModel>

	updatePayment(
		payment: PaymentModel,
		dto: PaymentUpdateDto,
		trx?: TransactionOrKnex
	): Promise<void>

	getHistory(userId: number): Promise<PaymentModel[]>
}
