import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserModel } from '../../user/models/user.model'
import YooKassa from 'yookassa-ts/lib/yookassa'
import { MyBaseModel } from '../../common/database/base.model'
import { PaymentModel, PaymentStatus } from '../models/payment.model'
import { CurrencyEnum } from 'yookassa-ts/lib/types/Common'
import { PaymentNotifyDto } from '../dto/in/payment-notify.dto'
import { PaymentStatusEnum } from 'yookassa-ts/lib/types/Payment'
import { PlanModel } from '../models/plan.model'
import { PlanService } from './plan.service'
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY
} from '../repositories/payment-repository.interface'
import { TransactionOrKnex } from 'objection'
import { I18nContext, I18nService } from 'nestjs-i18n'

export interface IOrderResult {
  payment: PaymentModel
  url: string
}

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
    private readonly configService: ConfigService,
    private readonly planService: PlanService,
    private i18n: I18nService
  ) {}

  public async order(plan: PlanModel, months: number, user: UserModel): Promise<IOrderResult> {
    if (!months) {
      months = 1
    }

    const yooKassa = new YooKassa({
      shopId: this.configService.get('SHOP_ID'),
      secretKey: this.configService.get('SHOP_SECRET')
    })

    const transaction = await MyBaseModel.startTransaction()
    try {
      const paymentModel = await this.paymentRepository.createPayment(
        plan,
        months,
        user,
        transaction
      )

      const payment = await yooKassa.createPayment({
        amount: {
          value: plan.price * months + '.00',
          currency: CurrencyEnum.RUB
        },
        confirmation: {
          type: 'redirect',
          return_url: this.configService.get('CLIENT_URL'),
          confirmation_url: this.configService.get('PAYMENT_CONFIRMATION_URL')
        },
        description: 'Order ' + paymentModel.id,
        capture: true
      })

      if (payment.id) {
        console.log('Order response from Yookassa: ', payment)

        await this.paymentRepository.updatePayment(
          paymentModel,
          {
            externalId: payment.id
          },
          transaction
        )
      } else {
        console.error(payment)
        throw new Error('Payment returned without id')
      }

      await transaction.commit()

      return { payment: paymentModel, url: payment.confirmationUrl }
    } catch (e) {
      await transaction.rollback()
      throw e
    }
  }

  public async processNotification(paymentNotifyDto: PaymentNotifyDto) {
    const paymentModel = await this.getPaymentByExternalId(paymentNotifyDto.object.id)

    if (!paymentModel) {
      console.error(`Payment ID ${paymentNotifyDto.object.id} not found`)
      throw new NotFoundException(`Payment ID ${paymentNotifyDto.object.id} not found`)
    }

    // if already success payment, don't do anything
    if (paymentModel.status === PaymentStatus.success) {
      console.log(`Payment ID ${paymentNotifyDto.object.id} already ${PaymentStatus.success}`)
      return
    }

    switch (paymentNotifyDto.object.status) {
      case PaymentStatusEnum.SUCCEEDED:
        console.log(`Payment ID ${paymentNotifyDto.object.id} SUCCESS, activating plan`)

        const transaction = await MyBaseModel.startTransaction()
        try {
          await this.paymentRepository.updatePayment(
            paymentModel,
            {
              status: PaymentStatus.success
            },
            transaction
          )

          await this.planService.activatePlan(paymentModel, transaction)

          await transaction.commit()
        } catch (e) {
          console.error(e)
          await transaction.rollback()
          throw e
        }
        break
      case PaymentStatusEnum.CANCELED:
        console.log(`Payment ID ${paymentNotifyDto.object.id} CANCEL, cancelling payment`)
        await this.paymentRepository.updatePayment(paymentModel, {
          status: PaymentStatus.canceled
        })
        break
    }
  }

  public async getHistory(userId: number): Promise<PaymentModel[]> {
    return this.paymentRepository.getHistory(userId)
  }

  public async getPayment(id: number, trx?: TransactionOrKnex): Promise<PaymentModel> {
    const payment = await this.paymentRepository.getPayment(id, trx)

    if (!payment) {
      throw new NotFoundException(
        this.i18n.t('payment.not_found', { lang: I18nContext.current().lang, args: { id: id } })
      )
    }

    return payment
  }

  public async getPaymentByExternalId(id: string, trx?: TransactionOrKnex): Promise<PaymentModel> {
    const payment = await this.paymentRepository.getPaymentByExternalId(id, trx)

    if (!payment) {
      throw new NotFoundException(
        this.i18n.t('payment.not_found', { lang: I18nContext.current().lang, args: { id: id } })
      )
    }

    return payment
  }
}
