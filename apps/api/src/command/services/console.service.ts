import { Injectable, Type } from '@nestjs/common'
import { CommandRunner } from 'nest-commander'
import { ModuleRef } from '@nestjs/core'
import { GeneratorCommand } from '../commands/generator.command'
import { ObjectionService } from '@squareboat/nestjs-objection'
import { FilesizerCommand } from '../commands/filesizer.command'

@Injectable()
export class ConsoleService {
	private commands: { [key: string]: Type<CommandRunner> } = {
		generator: GeneratorCommand,
		filesizer: FilesizerCommand
	}

	constructor(private moduleRef: ModuleRef) {}

	public async run(params: string[]) {
		if (!params.length) {
			console.error('Provide command to run. Available commands: ', Object.keys(this.commands))
		} else {
			try {
				const command = this.getCommand(params[0])
				await command.run(params.slice(1))
			} catch (e) {
				console.error(e)
			}
		}

		await this.afterRun()
	}

	private getCommand(key: string): CommandRunner {
		const commandClass = this.commands[key]
		if (!commandClass) {
			throw new Error(`Command ${key} does not exist. Commands: ` + Object.keys(this.commands))
		}

		return this.moduleRef.get(commandClass)
	}

	private async afterRun() {
		await ObjectionService.connection().destroy()
	}
}
