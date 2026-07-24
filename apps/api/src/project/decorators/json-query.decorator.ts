import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

export const JsonQuery = createParamDecorator(
	async (data: { name: string; dto: any }, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()
		const filter = request.query[data.name]

		if (!filter) {
			return undefined
		}

		let filterDTO
		try {
			filterDTO = JSON.parse(filter)
		} catch (error) {
			throw new BadRequestException(`Invalid JSON format for ${data.name} parameter`)
		}

		const errors = await validate(plainToInstance(data.dto, filterDTO))
		if (errors.length > 0) {
			throw new BadRequestException('Invalid filter parameters')
		}

		return filterDTO
	}
)
