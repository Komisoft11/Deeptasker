import { ROLES_KEY } from './roles-auth.decorator'
import { JwtService } from '@nestjs/jwt'
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GlobalRole } from '../../user/access/enum.role'
import { I18nContext } from 'nestjs-i18n'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private jwtService: JwtService, private reflector: Reflector) {}

	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest()
		const i18n = I18nContext.current()

		// admin has access to everything
		if (req.user.role === GlobalRole.Admin) {
			return true
		}

		try {
			const requiredRoles = this.reflector.getAllAndOverride<GlobalRole[]>(ROLES_KEY, [
				context.getHandler(),
				context.getClass()
			])

			if (!requiredRoles.length) {
				return true
			}

			return requiredRoles.includes(req.user.role)
		} catch (e) {
			throw new ForbiddenException(i18n.t('auth.security.forbidden'))
		}
	}
}
