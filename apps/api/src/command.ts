import { NestFactory } from '@nestjs/core'
import { CommandModule } from './command/command.module'
import { ConsoleService } from './command/services/console.service'
import * as process from 'process'

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(CommandModule, { logger: false })
	const consoleService = app.get(ConsoleService)

	const args = process.argv.slice(2)
	await consoleService.run(args)

	await app.close()

	process.exit(0)
}

bootstrap()
