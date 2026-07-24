import { TaskModel } from '../../task/models/task.model'

export interface ITasksOnDate {
	id: number
	planDate: string
	dayOfWeek: number
	tasks: TaskModel[]
}
