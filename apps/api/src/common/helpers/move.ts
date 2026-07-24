import { MoveDto } from '../dto/move.dto'
import { TaskModel } from '../../task/models/task.model'

class MoveHelper {
	constructor() {}

	public isMoveFromOldParentToNew(task: TaskModel, moveDto: MoveDto): boolean {
		return !!(task.parentId && moveDto.newParentId)
	}

	public isMoveFromOldParentToRoot(task: TaskModel, moveDto: MoveDto): boolean {
		return !!(task.parentId && !moveDto.newParentId)
	}

	public isMoveFromRootToParent(task: TaskModel, moveDto: MoveDto): boolean {
		return !!(moveDto.newParentId && !task.parentId)
	}

	public isReorder(task: TaskModel, moveDto: MoveDto): boolean {
		return !moveDto.newParentId && !task.parentId
	}
}

export default new MoveHelper()
