import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PaymentNotifyDto } from './dto/in/payment-notify.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { GlobalRole } from '../user/access/enum.role'
import { User } from '../auth/decorators/user.decorator'
import { PlanOrderDto } from './dto/in/plan-order.dto'
import { UserModel } from '../user/models/user.model'

import { PaymentService } from './services/payment.service'
import { PlanService } from './services/plan.service'
import { PlanDto } from './dto/out/plan.dto'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { PlanModel } from './models/plan.model'
import { PaymentModel } from './models/payment.model'
import { PaymentDto } from './dto/out/payment.dto'

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly planService: PlanService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly paymentService: PaymentService
  ) {}

  @Post('notify')
  @HttpCode(HttpStatus.OK)
  async notify(@Body() paymentNotifyDto: PaymentNotifyDto) {
    console.log('Payment', paymentNotifyDto)
    return this.paymentService.processNotification(paymentNotifyDto)
  }

  @Auth(GlobalRole.User)
  @Post('order')
  @HttpCode(HttpStatus.OK)
  async pay(
    @Body() planOrderDto: PlanOrderDto,
    @User() user: UserModel
  ): Promise<{ paymentId: number; url: string }> {
    const plan = await this.planService.getPlan(planOrderDto.planId)

    const orderResult = await this.paymentService.order(plan, planOrderDto.months, user)

    return { paymentId: orderResult.payment.id, url: orderResult.url }
  }

  @Auth(GlobalRole.User)
  @Get('history')
  async getHistory(@User() user: UserModel): Promise<PaymentDto[]> {
    const payments = await this.paymentService.getHistory(user.id)

    return this.mapper.mapArray(payments, PaymentModel, PaymentDto)
  }

  @Auth(GlobalRole.User)
  @Get('plans')
  async getPlans(@User() user: UserModel): Promise<PlanDto[]> {
    const plans = await this.planService.getAllPlans(user.id)

    return this.mapper.mapArray(plans, PlanModel, PlanDto)
  }

  @Auth(GlobalRole.User)
  @Get('plans/active')
  async getActivePlan(@User() user: UserModel): Promise<PlanDto> {
    const plan =
      (await this.planService.getCurrentActivePlan(user.id)) ??
      (await this.planService.getDefaultPlan())

    return this.mapper.map(plan, PlanModel, PlanDto)
  }
}
