import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { RolesGuard } from '../guards/roles.guard'
import { JwtAuthGuard } from '../guards/jwt.guard'
import { GlobalRole } from '../../user/access/enum.role'
import { ROLES_KEY } from '../guards/roles-auth.decorator'

export function Auth(...roles: GlobalRole[]) {
	return applyDecorators(
		SetMetadata(ROLES_KEY, roles),
		UseGuards(JwtAuthGuard, RolesGuard)
		// ApiUnauthorizedResponse({ description: 'Unauthorized' }),
	)
}
