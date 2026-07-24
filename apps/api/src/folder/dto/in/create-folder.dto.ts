import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator'

export class CreateFolderDto {
	@IsOptional()
	@MaxLength(255)
	title: string | null

	@IsNotEmpty()
	projectId: number

	@IsOptional()
	parentId?: number
}
