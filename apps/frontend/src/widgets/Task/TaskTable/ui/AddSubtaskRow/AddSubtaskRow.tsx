import classNames from 'classnames'
import React, { Dispatch, SetStateAction } from 'react'
import styles from '@/widgets/Task/TaskTable/TaskTable.module.scss'
import { AddTaskInput, Task } from '@/entities/Task'
import { CloseButton } from '@/shared/ui/Button/CloseButton/CloseButton'
import { Table } from '@/shared/ui/Table/Table'

interface Props {
  parentTask: Task
  depth: number
  setCurrentTaskId?: Dispatch<SetStateAction<number | null>>
}

export const AddSubtaskRow = ({
  parentTask,
  depth,
  setCurrentTaskId
}: Props) => {
  const handleClose = () => {
    setCurrentTaskId?.(null)
    parentTask.isCollapsed = false
  }

  return (
    <Table.Row className={classNames(styles.row, styles.addRow)}>
      <Table.Cell
        className={styles.cell}
        style={{
          paddingLeft: `${48 + 16 * depth}px`
        }}
        data-cell={'input'}
      >
        <div className={styles.circle}></div>
        <AddTaskInput
          parent={parentTask}
          className={styles.input}
          handleClickCancel={handleClose}
          afterSubmit={handleClose}
          containerClassName={'focus-within:!outline-none'}
        />
      </Table.Cell>
      <Table.Cell className={styles.cell} data-cell={'subtask-actions'}>
        <CloseButton onClick={() => setCurrentTaskId?.(null)} />
      </Table.Cell>
    </Table.Row>
  )
}
