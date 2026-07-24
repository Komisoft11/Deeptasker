import { AutoMap } from '@automapper/classes'
import { PlanDto } from "./plan.dto";

export class PaymentDto {
	@AutoMap()
	id: number

	@AutoMap()
	amount: number

	@AutoMap()
	months: number

	@AutoMap()
	status: string

	@AutoMap()
	dateCreated: Date

	@AutoMap(() => PlanDto)
	plan?: PlanDto

	paymentUrl?: string
}
