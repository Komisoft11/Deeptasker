import { IYookassaNotification } from '../../interfaces/yookassa.interface'
import { PaymentStatusEnum } from 'yookassa-ts/lib/types/Payment'
import { CurrencyEnum } from 'yookassa-ts/lib/types/Common'
import { IPaymentMethod } from 'yookassa-ts/lib/types/PaymentMethod'

export class PaymentNotifyDto implements IYookassaNotification {
	type: 'notification'
	event: string
	object: {
		id: string
		status: PaymentStatusEnum
		paid: boolean
		amount: { value: string; currency: CurrencyEnum }
		created_at: Date
		description: string
		expires_at: Date
		payment_method: { type: IPaymentMethod }
		refundable: boolean
		test: boolean
	}
}