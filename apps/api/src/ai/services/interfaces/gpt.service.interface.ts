export const GPT_SERVICE = 'IGPTService'

export interface IGPTService {
	send(prompt: string): Promise<string>
}
