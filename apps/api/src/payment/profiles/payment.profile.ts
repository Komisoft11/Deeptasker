import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { createMap, forMember, mapFrom, MappingProfile } from '@automapper/core'
import type { Mapper } from '@automapper/core'
import { PlanModel } from '../models/plan.model'
import { PlanDto } from '../dto/out/plan.dto'
import { PaymentModel, PaymentStatus } from '../models/payment.model'
import { PaymentDto } from '../dto/out/payment.dto'
import { UserPlanModel } from '../models/user-plan.model'
import { UserPlanDto } from '../dto/out/user-plan.dto'
import { generateYooKassaPaymentUrl } from '../yookassa/yookassa.helper'

@Injectable()
export class PaymentProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper)
	}

	get profile(): MappingProfile {
		return mapper => {
			createMap(mapper, PlanModel, PlanDto)
			createMap(
				mapper,
				PaymentModel,
				PaymentDto,
				forMember(
					destination => destination.paymentUrl,
					mapFrom(source =>
						source.status === PaymentStatus.wait
							? generateYooKassaPaymentUrl(source.externalId)
							: undefined
					)
				)
			)
			createMap(mapper, UserPlanModel, UserPlanDto)
		}
	}
}
