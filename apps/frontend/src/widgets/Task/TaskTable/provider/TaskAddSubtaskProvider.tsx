import { ReactNode, createContext, useState } from 'react'

export interface ITaskAddSubtaskContext {
  showInputForTask: number | null
  changeTaskIdForShowInput?: (taskId: number | null) => void
}

export const TaskAddSubtaskContext = createContext<ITaskAddSubtaskContext>({
  showInputForTask: null
})

export const TaskAddSubtaskProvider = ({
  children
}: {
  children: ReactNode
}) => {
  const [showInputForTask, setShowInputForTask] = useState<number | null>(null)

  const changeTaskIdForShowInput = (taskId: number | null): void => {
    if (showInputForTask === taskId) {
      setShowInputForTask(null)
    } else {
      return setShowInputForTask(taskId)
    }
  }

  return (
    <TaskAddSubtaskContext.Provider
      value={{
        showInputForTask,
        changeTaskIdForShowInput
      }}
    >
      {children}
    </TaskAddSubtaskContext.Provider>
  )
}
