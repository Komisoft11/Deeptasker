import { FC } from 'react'
import { Task } from '@/entities/Task'
import { TaskService } from '@/entities/Task/services/task.service'
import { ExtraInfoLayout } from '@/entities/Task/ui/ExtraInfoLayout/ExtraInfoLayout'
import { Tree } from '@/shared/assets/images/icons'

interface Props {
  task: Task
}

export const SubTaskQuantity: FC<Props> = ({ task }) => {
  return (
    <ExtraInfoLayout>
      <Tree />
      <p>
        {TaskService.getCountExecuteSubtask(task)}/{task.subtasks.length}
      </p>
    </ExtraInfoLayout>
  )
}
