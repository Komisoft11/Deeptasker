import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import {
  ProjectRoleEnum,
  ProjectRoleType
} from '../../../components/permissions/types/roles/project-role.interface'

export class InviteUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsOptional()
  @IsEnum(ProjectRoleEnum)
  role?: ProjectRoleType
}
