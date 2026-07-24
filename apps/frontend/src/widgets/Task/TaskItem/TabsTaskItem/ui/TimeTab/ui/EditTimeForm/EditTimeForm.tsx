import { yupResolver } from '@hookform/resolvers/yup'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import React, { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTimeTabValidation } from '@/widgets/Task/TaskItem/TabsTaskItem/hooks/useTimeTabValidation'
import { editTimeSchema } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/AddTime/lib/timeSchema'
import { FormValues } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/TimeTab'
import styles from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/TimeTab.module.scss'
import { useTimeHistory } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/hooks/useTimeHistory'
import { useTimeTabColumns } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/hooks/useTimeTabColumns'
import { CommentSection } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/ui/CommentSection/CommentSection'
import { TaskTimerHistoryResponse } from '@/entities/Task/model/types/task-response.interface'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Table } from '@/shared/ui/Table/Table'

dayjs.extend(utc)
dayjs.extend(timezone)

interface Props {
  time: TaskTimerHistoryResponse
}

export const EditTimeForm: FC<Props> = ({ time }) => {
  const {
    taskStore: { activeTask }
  } = useRootStore()
  const { changeTimerHistoryAsync } = useTimeHistory(activeTask)
  const validationFunctions = useTimeTabValidation()

  const [editCommentId, setEditCommentId] = useState<number | null>(null)
  const [editEndTimeId, setEditEndTimeId] = useState<number | null>(null)

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset
  } = useForm<FormValues>({
    resolver: yupResolver(
      editTimeSchema(
        validationFunctions,
        time.startTime as Date,
        time.id,
        editEndTimeId
      )
    ),
    mode: 'onChange',
    context: {
      previousComment: time.comment
    }
  })

  const onSubmit = async ({ comment, endDate }: FormValues) => {
    if (!editCommentId) {
      return
    }

    if (!editEndTimeId && isValid) {
      await changeTimerHistoryAsync.mutateAsync({
        task: activeTask,
        historyId: editCommentId,
        timerUpdatedFields: { comment: comment }
      })

      resetState()
    } else {
      await changeTimerHistoryAsync.mutateAsync({
        task: activeTask,
        historyId: editCommentId,
        timerUpdatedFields: {
          endTime: dayjs(endDate).utc().toDate(),
          comment: comment
        }
      })

      resetState()
    }
  }

  const resetState = () => {
    setEditCommentId(null)
    setEditEndTimeId(null)
    reset()
  }

  const columns = useTimeTabColumns({
    setEditEndTimeId,
    editEndTimeId,
    setEditCommentId,
    control,
    errors,
    resetState
  })

  return (
    <form
      className={styles.timeContainer}
      key={time.id}
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          resetState()
        }
      }}
    >
      <Table.Row className={styles.tableRow}>
        {columns.map((c, index) => (
          <Table.Cell key={`${String(c.id)}:${index}`} data-state={c.id}>
            {c.cell(time)}
          </Table.Cell>
        ))}
      </Table.Row>
      {(time.comment || editCommentId === time.id) && (
        <CommentSection
          time={time}
          errors={errors}
          control={control}
          editCommentId={editCommentId}
          setEditCommentId={setEditCommentId}
        />
      )}
    </form>
  )
}
