import classNames from 'classnames'
import React, { FC } from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { FormValues } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/TimeTab'
import styles from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/TimeTab.module.scss'
import { useTimeHistory } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/hooks/useTimeHistory'
import { TaskTimerHistoryResponse } from '@/entities/Task/model/types/task-response.interface'
import { Edit, Trash } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'

interface Props {
  time: TaskTimerHistoryResponse
  editCommentId: number | null
  setEditCommentId: (editCommentId: number | null) => void
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
}

export const CommentSection: FC<Props> = ({
  time,
  control,
  errors,
  editCommentId,
  setEditCommentId
}) => {
  const {
    authStore: { user },
    taskStore: { activeTask }
  } = useRootStore()
  const { changeTimerHistoryAsync } = useTimeHistory(activeTask)
  const isOwner = time.user.id === user.id
  return (
    <div className={styles.comment}>
      <div className={'flex justify-between items-center'}>
        <p className={'py-1 body-12 secondaryText'}>Комментарий</p>
        {editCommentId !== time.id && isOwner && (
          <div className={'flex gap-1'}>
            <div
              className={classNames(
                'iconContainer',
                editCommentId === time.id && 'bg-hover'
              )}
              onClick={() => {
                setEditCommentId(time.id)
              }}
            >
              <Edit className={'w-4 h-4 icon'} />
            </div>
            {!time.editedDate && (
              <div
                className={'iconContainer'}
                onClick={() =>
                  changeTimerHistoryAsync.mutateAsync({
                    task: activeTask,
                    historyId: time.id,
                    timerUpdatedFields: {
                      comment: ''
                    }
                  })
                }
              >
                <Trash className={'w-4 h-4 iconRed'} />
              </div>
            )}
          </div>
        )}
      </div>
      {editCommentId === time.id ? (
        <div className={'flex flex-col gap-1'}>
          <Controller
            name={'comment'}
            control={control}
            defaultValue={time.comment || ''}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                placeholder='Введите комментарий'
                containerClassName={
                  errors.comment &&
                  '!outline-[1px] !outline-systemRed rounded-lg'
                }
              >
                <KbdElement kdb={'Enter'} tooltipContent={'Отправить'} />
              </Input>
            )}
          />
          {(errors.comment || errors.endDate) && (
            <p className={'body-12 text-systemRed'}>
              {errors.comment?.message || errors.endDate?.message}
            </p>
          )}
        </div>
      ) : (
        time.comment && <p className={'body-12'}>{time.comment}</p>
      )}
    </div>
  )
}
