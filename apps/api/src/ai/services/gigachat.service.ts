import { Injectable } from '@nestjs/common'
import { IGPTService } from './interfaces/gpt.service.interface'
import { ConfigService } from '@nestjs/config'
import { AIErrorException } from '../exceptions/ai-error.exception'
import { GigaChat } from 'gigachat-node'

@Injectable()
export class GigachatService implements IGPTService {
	private client: GigaChat

	constructor(private readonly config: ConfigService) {
		this.client = new GigaChat({
			clientSecretKey: this.config.get('GIGA_AUTH'),
			isIgnoreTSL: true,
			isPersonal: this.config.get('GIGA_PERSONAL') ?? true,
			autoRefreshToken: true,
			imgOn: false
		})
	}

	public async send(prompt: string): Promise<string> {
		prompt = prompt.trim()

		if (!prompt.length) {
			throw new AIErrorException('Empty prompt')
		}

		try {
			if (!this.client.authorization) {
				await this.client.createToken()
			}

			const result = await this.client.completion({
				model: 'GigaChat:latest',
				messages: [
					{
						role: 'user',
						content: prompt
					}
				]
			})

			return result.choices[0].message.content
		} catch (e) {
			console.error(e)
			throw new AIErrorException(e)
		}
	}
}
