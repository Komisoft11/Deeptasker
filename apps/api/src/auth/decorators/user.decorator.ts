import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserModel } from '../../user/models/user.model'

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): UserModel => {
	const request = ctx.switchToHttp().getRequest()
	return request.user as UserModel
})
