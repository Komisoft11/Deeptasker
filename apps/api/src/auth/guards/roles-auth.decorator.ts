import { GlobalRole } from '../../user/access/enum.role'
import { SetMetadata } from '@nestjs/common'

export const ROLES_KEY = 'roles'

export const Roles = (...roles: GlobalRole[]) => SetMetadata(ROLES_KEY, roles)
