import { Injectable } from '@nestjs/common'
import { TaskModel } from '../../task/models/task.model'
import { UserModel } from '../../user/models/user.model'
import { GlobalRole } from '../../user/access/enum.role'
import { TaskAuthService } from '../../task/auth/task-auth.service'

@Injectable()
export class TaskPlanAuthService {
	constructor(private readonly taskAuthService: TaskAuthService) {}

	public async canCreate(task: TaskModel, user: UserModel) {
		if (user.role === GlobalRole.Admin) {
			return true
		}

		return await this.taskAuthService.modelAuth.canAssign(user, task)
	}

	async canChangeDayInfo(task: TaskModel, user: UserModel) {
		if (user.role === GlobalRole.Admin) {
			return true
		}

		return await this.taskAuthService.modelAuth.canAssign(user, task)
	}

	public async canUpdate(task: TaskModel, user: UserModel): Promise<boolean> {
		if (user.role === GlobalRole.Admin) {
			return true
		}

		return await this.taskAuthService.modelAuth.canAssign(user, task)
	}

	public async canDelete(task: TaskModel, user: UserModel): Promise<boolean> {
		if (user.role === GlobalRole.Admin) {
			return true
		}

		return this.taskAuthService.modelAuth.canAssign(user, task)
	}
}