import { useContext } from 'react'
import { TaskAddSubtaskContext } from 'widgets/Task/TaskTable'
import { ITaskAddSubtaskContext } from '@/widgets/Task/TaskTable/provider/TaskAddSubtaskProvider'


export const useTaskAddSubtaskContext = () => {
  const { showInputForTask, changeTaskIdForShowInput } =
    useContext<ITaskAddSubtaskContext>(TaskAddSubtaskContext)
  if (changeTaskIdForShowInput === undefined) {
    throw new Error('not found callback (changeTaskIdForShowInput) in context')
  }

  return {
    showInputForTask,
    changeTaskIdForShowInput
  }
}
