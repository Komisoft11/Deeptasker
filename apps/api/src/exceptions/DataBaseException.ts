import { HttpException, HttpStatus } from '@nestjs/common'

export class DataBaseException extends HttpException {
	constructor(error: Error) {
		const message: string | null = error.message ?? null
		super(message ? `DataBase Error: ${message}` : 'DB Exception', HttpStatus.INTERNAL_SERVER_ERROR)
	}
}
