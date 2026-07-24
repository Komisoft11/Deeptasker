import { IsHexColor, IsInt, IsNotEmpty, Min, MinLength, ValidateIf } from 'class-validator'

export class UpdateStatusDto {
    @ValidateIf(o => o.name !== undefined)
    @MinLength(3)
    name?: string

    @ValidateIf(o => o.order !== undefined)
    @IsInt()
    @Min(1)
    order?: number

    @ValidateIf(o => o.color !== undefined)
    @IsHexColor()
    color?: string
}
