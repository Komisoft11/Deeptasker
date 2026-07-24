import { Injectable } from '@nestjs/common'
import { YandexGPT } from '@langchain/yandex'
import { AIErrorException } from '../exceptions/ai-error.exception'
import { ConfigService } from '@nestjs/config'
import { IGPTService } from './interfaces/gpt.service.interface'

@Injectable()
export class YaGPTService implements IGPTService {
	private model: YandexGPT

	constructor(private readonly config: ConfigService) {
		this.model = new YandexGPT({
			apiKey: this.config.get('YAGPT_KEY'),
			iamToken: this.config.get('YAGPT_IAM'),
			folderID: this.config.get('YAGPT_FOLDER_ID')
		})
	}

	public async send(prompt: string): Promise<string> {
		prompt = prompt.trim()

		if (!prompt.length) {
			throw new AIErrorException('Empty prompt')
		}

		try {
			return this.model.invoke([prompt])
		} catch (e) {
			console.error(e)
			throw new AIErrorException(e)
		}
	}
}
