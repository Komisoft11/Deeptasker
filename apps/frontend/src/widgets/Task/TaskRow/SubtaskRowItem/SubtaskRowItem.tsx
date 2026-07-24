import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { ComponentPropsWithoutRef, useState } from 'react'
import { ExecuteTask } from '@/widgets/Task'
import { TitleTask } from '@/widgets/Task/TaskRow/ui/TitleTask/TitleTask'
import { TaskExtraInfo } from '@/features/Task/TaskExtraInfo/TaskExtraInfo'
import { AddTaskInput, Task } from '@/entities/Task'
import { CaretDown, CaretRight, Close } from '@/shared/assets/images/icons'
import { StatusCodes } from '@/shared/const/statusCodes'
import styles from './SubtaskRowItem.module.scss'

interface Props extends ComponentPropsWithoutRef<'div'> {
  task: Task
  activeTaskId: number | null
  setActiveTaskId: (activeTaskId: number | null) => void
  setToggleAddTask: (toggleAddTask: boolean) => void
  toggleAddTask: boolean
}

export const SubtaskRowItem = observer(
  ({
    task,
    activeTaskId,
    setActiveTaskId,
    setToggleAddTask,
    toggleAddTask
  }: Props) => {
    return (
      <Row
        task={task}
        depth={0}
        setActiveTaskId={setActiveTaskId}
        activeTaskId={activeTaskId}
        setToggleAddTask={setToggleAddTask}
        toggleAddTask={toggleAddTask}
      />
    )
  }
)

interface RowProps extends Props {
  depth: number
}

const Row = observer(
  ({
    task,
    depth,
    setActiveTaskId,
    activeTaskId,
    setToggleAddTask,
    toggleAddTask
  }: RowProps) => {
    const isFinished = task.status.code === StatusCodes.EXECUTED
    const showInput = activeTaskId === task.id
    const [isEditTitle, setIsEditTitle] = useState(false)

    const toggleCollapse = () => {
      task.isCollapsed = !task.isCollapsed
    }

    const toggleInput = (taskId: number | null) => {
      setActiveTaskId(activeTaskId === taskId ? null : taskId)
    }

    return (
      <>
        <div className={styles.row}>
          <div
            className={styles.title}
            style={{
              paddingLeft: `${16 * depth}px`
            }}
          >
            <div className='flex gap-2 items-center'>
              {task.subtasks.length > 0 || showInput ? (
                <div className='w-5 h-8 flex justify-center items-center shrink-0'>
                  {!task.isCollapsed ? (
                    <CaretDown
                      className='icon w-4 h-4 hover:cursor-pointer'
                      onClick={toggleCollapse}
                    />
                  ) : (
                    <CaretRight
                      className='icon w-4 h-4 hover:cursor-pointer'
                      onClick={toggleCollapse}
                    />
                  )}
                </div>
              ) : (
                <div className='w-5 h-8 shrink-0' />
              )}

              <div className='flex gap-2 items-center w-full'>
                <ExecuteTask task={task} circleClassName='w-4 h-4' />

                <TitleTask
                  task={task}
                  className={classNames(
                    'ellipsis max-w-[90%] body-14-16',
                    isFinished && 'line-through opacity-50'
                  )}
                  isEditTitle={isEditTitle}
                  setIsEditTitle={setIsEditTitle}
                >
                  {task.title}
                </TitleTask>
              </div>
            </div>
          </div>
          <TaskExtraInfo
            task={task}
            setIsEditTitle={setIsEditTitle}
            isEditTitle={isEditTitle}
            onPlusClick={() => {
              if (toggleAddTask) {
                setToggleAddTask(false)
              }
              toggleInput(task.id)
            }}
            showInput={showInput}
          />
        </div>

        {showInput && (
          <div className={styles.inputContainer}>
            <div className='w-5 h-10'></div>
            <ExecuteTask
              task={task}
              circleClassName='pointer-events-none border-border w-4 h-4'
            />
            <AddTaskInput
              afterSubmit={() => {
                setActiveTaskId(null)
                task.isCollapsed = false
              }}
              parent={task}
              autoFocus
              className={classNames(styles.inputField, 'body-14-16')}
              containerClassName='!outline-none'
            />
            <div
              className='p-2 w-max rounded-lg hover:bg-hover hover:cursor-pointer'
              onClick={() => {
                setActiveTaskId(null)
              }}
            >
              <Close className='icon w-4 h-4' />
            </div>
          </div>
        )}

        {!task.isCollapsed &&
          task.subtasks.map((subtask) => (
            <Row
              key={subtask.id}
              task={subtask}
              depth={depth + 1}
              setActiveTaskId={setActiveTaskId}
              activeTaskId={activeTaskId}
              toggleAddTask={toggleAddTask}
              setToggleAddTask={setToggleAddTask}
            />
          ))}
      </>
    )
  }
)
