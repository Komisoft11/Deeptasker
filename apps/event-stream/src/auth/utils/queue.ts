const queueName = 'events-' + crypto.randomUUID()

export function getQueueName() {
	return queueName
}