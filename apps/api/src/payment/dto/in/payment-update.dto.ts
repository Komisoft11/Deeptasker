import { IsNumber, IsOptional } from 'class-validator'
import { PaymentStatus } from '../../models/payment.model'

export class PaymentUpdateDto {
	@IsOptional()
	@IsNumber()
	externalId?: string

	@IsOptional()
	status?: PaymentStatus
}
