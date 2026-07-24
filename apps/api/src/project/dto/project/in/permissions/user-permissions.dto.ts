import { IsBoolean } from 'class-validator'
import { ProjectUserPermissions } from '../../../../components/permissions/types/roles/user-permissions.interface'
import { GuestPermissionsDto } from './guest-permissions.dto'

export class UserPermissionsDto extends GuestPermissionsDto implements ProjectUserPermissions {
  @IsBoolean()
  createTasks: boolean

  @IsBoolean()
  createFolders: boolean

  @IsBoolean()
  createTags: boolean

  @IsBoolean()
  updateTags: boolean

  @IsBoolean()
  deleteTags: boolean
}
