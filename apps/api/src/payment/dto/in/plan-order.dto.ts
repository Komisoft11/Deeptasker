import { IsNotEmpty, IsNumber } from "class-validator";

export class PlanOrderDto {
    @IsNotEmpty()
    @IsNumber()
    planId: number

    @IsNumber()
    months: number
}