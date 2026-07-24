import { Command, CommandRunner } from 'nest-commander'
import { ProjectGeneratorService } from '../services/project-generator.service'

@Command({ name: 'generator' })
export class GeneratorCommand extends CommandRunner {
	private readonly generators: {
		[key: string]: (self: GeneratorCommand, params: string[]) => Promise<void>
	} = {
		project: this.generateProject
	}

	constructor(private readonly projectGenerator: ProjectGeneratorService) {
		super()
	}

	async run(params: string[], options?: Record<string, any>): Promise<void> {
		if (!params.length) {
			console.error(
				'Give what to generate as a parameter. Available: ',
				Object.keys(this.generators)
			)
		} else {
			try {
				const generator = this.generators[params[0]]
				if (!generator) {
					console.error("Don't know how to generate that")
				} else {
					await generator(this, params)
				}
			} catch (e) {
				console.error(e)
			}
		}
	}

	private async generateProject(self: GeneratorCommand, params: string[]) {
		if (params.length < 2) {
			console.error('Provide workspace ID')
			return
		}

		const workspaceId = parseInt(params[1])

		await self.projectGenerator.generate(workspaceId)
	}
}
