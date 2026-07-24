export function generateYooKassaPaymentUrl(externalOrderId: string): string {
	return 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=' + externalOrderId
}
