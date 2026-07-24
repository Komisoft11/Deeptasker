import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsNotEmpty, IsNumber } from 'class-validator'
import { PermissionsRoleDto } from './permissions/permissions-role.dto'
import {
  ProjectRoleEnum,
  ProjectRoleType
} from '../../../components/permissions/types/roles/project-role.interface'

class userDto implements PermissionsRoleDto {
  @IsNotEmpty()
  @IsNumber()
  id: number

  @IsNotEmpty()
  @IsEnum(ProjectRoleEnum)
  role: ProjectRoleType
}

export class InviteUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsEnum(ProjectRoleEnum)
  @ArrayNotEmpty()
  role: ProjectRoleType
}

export class AddUserProjectDto {
  @IsArray()
  @ArrayNotEmpty()
  invitees: InviteUserDto[]
}
