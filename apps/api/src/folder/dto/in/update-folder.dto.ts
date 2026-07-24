import { IsNotEmpty, ValidateIf } from 'class-validator'

export class UpdateFolderDto {
	@ValidateIf(object => object.title !== undefined)
	@IsNotEmpty()
	title?: string

	@ValidateIf(object => object.customOrder !== undefined)
	@IsNotEmpty()
	customOrder?: number

	@ValidateIf(object => object.customOrder !== undefined)
	@IsNotEmpty()
	newParentId?: number

	@ValidateIf(object => object.newProjectId !== undefined)
	@IsNotEmpty()
	newProjectId?: number
}
