import { IsNotEmpty } from 'class-validator'

export class UploadDto {
	@IsNotEmpty()
	taskId: number
}
