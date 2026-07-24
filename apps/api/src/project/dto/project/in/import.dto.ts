import {IsEnum, IsNotEmpty} from "class-validator";
import {ProjectImportType} from "../../../../async-job/const";

export class ImportDto {
    @IsNotEmpty()
    @IsEnum(ProjectImportType)
    type: ProjectImportType
}