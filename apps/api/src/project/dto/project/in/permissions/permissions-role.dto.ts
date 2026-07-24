import { IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { UserPermissionsDto } from './user-permissions.dto'
import { AdminPermissionsDto } from './admin-permissions.dto'
import { ControllerPermissionsDto } from './controller-permissions.dto'
import { AssignerPermissionsDto } from './assigner-permissions.dto'
import { PermissionsDto } from './permissions.dto'
import { IProjectPermissionsRole } from '../../../../components/permissions/types/project-permissions.interface'
import {
  ProjectRoleEnum,
  ProjectRoleType
} from 'src/project/components/permissions/types/roles/project-role.interface'
import { GuestPermissionsDto } from './guest-permissions.dto'

export class PermissionsRoleDto implements IProjectPermissionsRole {
  @IsEnum(ProjectRoleEnum)
  role: ProjectRoleType

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionsDto, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'role',
      subTypes: [
        { value: UserPermissionsDto, name: ProjectRoleEnum.user },
        { value: AdminPermissionsDto, name: ProjectRoleEnum.admin },
        { value: ControllerPermissionsDto, name: ProjectRoleEnum.controller },
        { value: AssignerPermissionsDto, name: ProjectRoleEnum.assigner },
        { value: GuestPermissionsDto, name: ProjectRoleEnum.guest }
      ]
    }
  })
  permissions?: PermissionsDto
}
