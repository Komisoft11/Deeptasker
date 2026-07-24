import { Injectable } from '@nestjs/common'
import { UserModel } from '../models/user.model'
import { GlobalRole } from '../access/enum.role'

@Injectable()
export class UserAuthService {
	public canUpdate(user: UserModel, userToUpdate: UserModel): boolean {
		if (user.role === GlobalRole.Admin) {
			return true
		}

		return userToUpdate.id === user.id
	}
}