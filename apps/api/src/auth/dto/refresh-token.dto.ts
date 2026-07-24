import { AutoMap } from '@automapper/classes'
import { IsNotEmpty } from 'class-validator'

export class RefreshTokenDto {
	@AutoMap()
	@IsNotEmpty()
	token: string
}
