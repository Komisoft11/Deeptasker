import { Inject, Injectable } from '@nestjs/common'
import { GPT_SERVICE } from './interfaces/gpt.service.interface'
import type { IGPTService } from './interfaces/gpt.service.interface'

@Injectable()
export class TitleGeneratorService {
	constructor(@Inject(GPT_SERVICE) private readonly gptService: IGPTService) {}

	public async generate(taskText: string): Promise<string> {
		const result = await this.gptService.send(
			`Отвечай только новым названием задачи (без кавычек) и в том языке на котором написана задача. Сделай название этой задачи короче (максимум 90 символов) не теряя смысл: "${taskText}"`
		)

		return result.replace(/^"(.*)"$/, '$1')
	}
}
