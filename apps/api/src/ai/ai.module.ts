import { Module } from '@nestjs/common'
import { GPT_SERVICE } from './services/interfaces/gpt.service.interface'
import { TitleGeneratorService } from './services/title-generator.service'
import { GigachatService } from './services/gigachat.service'

@Module({
	providers: [
		{
			provide: GPT_SERVICE,
			useClass: GigachatService
		},
		TitleGeneratorService
	],
	imports: [],
	exports: [TitleGeneratorService]
})
export class AIModule {}
