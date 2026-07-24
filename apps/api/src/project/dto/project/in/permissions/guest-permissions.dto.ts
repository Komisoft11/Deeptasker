import { IsBoolean } from 'class-validator'
import { ProjectGuestPermissions } from '../../../../components/permissions/types/roles/guest-permissions.interface'

export class GuestPermissionsDto implements ProjectGuestPermissions {
  @IsBoolean()
  openTasks: boolean
}
