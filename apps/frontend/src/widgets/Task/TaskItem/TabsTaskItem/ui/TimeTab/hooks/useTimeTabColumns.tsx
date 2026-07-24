import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { FC, SVGProps, useState } from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { FormValues } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/TimeTab'
import styles from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/TimeTab.module.scss'
import { calculateTimeDifference } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/helpers/calculateTimeDifference'
import { useTimeHistory } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/hooks/useTimeHistory'
import { usePermissionTask } from '@/entities/Task'
import { TaskTimerHistoryResponse } from '@/entities/Task/model/types/task-response.interface'
import {
  Close,
  Comment,
  Edit,
  Trash,
  VerticalDots
} from '@/shared/assets/images/icons'
import { DATE_TIME_FULL_FORMAT } from '@/shared/const/date_format'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { DateTimePickerMantine } from '@/shared/ui/DateTimePickerMantine/DateTimePickerMantine'
import { Popover } from '@/shared/ui/Popover/Popover'
import { createColumnHelper } from '@/shared/ui/Table/lib/createColumnHelper'


interface UseTimeTabColumnsProps {
  editEndTimeId: number | null
  setEditEndTimeId: (editEndTimeId: number | null) => void
  setEditCommentId: (commentId: number | null) => void
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
  resetState: () => void
}

export const useTimeTabColumns = ({
  setEditCommentId,
  setEditEndTimeId,
  editEndTimeId,
  control,
  errors,
  resetState
}: UseTimeTabColumnsProps) => {
  const columnHelper = createColumnHelper<TaskTimerHistoryResponse>()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const {
    authStore: { user },
    taskStore: { activeTask, trackingTask }
  } = useRootStore()

  const { editTaskTracking } = usePermissionTask(activeTask)

  const { deleteTimeHistoryAsync } = useTimeHistory(activeTask)

  const handleEditEndTime = (time: TaskTimerHistoryResponse) => {
    setEditEndTimeId(time.id)
    setEditCommentId(time.id)
  }

  return [
    columnHelper.accessor({
      id: 'name',
      header: () => 'Имя',
      cell: (time) => (
        <div className={'flex gap-1'}>
          <p>{time.user.firstName}</p>
          <p>{time.user.lastName}</p>
        </div>
      )
    }),
    columnHelper.accessor({
      id: 'start',
      header: () => 'Начало',
      cell: (time) => (
        <p className={'py-3 w-full'}>
          {time.startTime
            ? formatDateTime({ date: time.startTime, includeSeconds: true })
            : ''}
        </p>
      )
    }),
    columnHelper.accessor({
      id: 'end',
      header: () => 'Окончание',
      cell: (time) => {
        return (
          <div className='flex items-center gap-2'>
            <div
              className={classNames(
                styles.endTimeContainer,
                'flex items-center gap-2'
              )}
            >
              {editEndTimeId === time.id ? (
                <>
                  <Controller
                    name={'endDate'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DateTimePickerMantine
                        clearable={false}
                        initialDate={dayjs(time.endTime).format(
                          DATE_TIME_FULL_FORMAT
                        )}
                        valueFormat={DATE_TIME_FULL_FORMAT}
                        onChange={onChange}
                        placeholder='Когда закончили?'
                        minDate={dayjs(time.startTime).toDate()}
                        maxDate={dayjs.utc().toDate()}
                        presets={undefined}
                        value={value ?? dayjs(time.endTime).toDate()}
                        withSeconds
                        classNamesOverride={{
                          timeInput: styles.timeInput,
                          list: 'w-[447px]',
                          levelsGroup: 'h-full',
                          wrapper: errors.endDate
                            ? 'outline outline-[1px] outline-systemRed rounded-lg'
                            : undefined
                        }}
                      />
                    )}
                  />
                </>
              ) : (
                <>
                  <p className={styles.cellContent}>
                    {time.endTime &&
                      formatDateTime({
                        date: time.endTime,
                        includeSeconds: true
                      })}
                  </p>
                </>
              )}
            </div>
          </div>
        )
      }
    }),
    columnHelper.accessor({
      id: 'time',
      header: () => 'Время',
      cell: (time) => (
        <p className={'body-14-16'}>
          {time.startTime && time.endTime
            ? calculateTimeDifference(
                new Date(time.startTime),
                new Date(time.endTime)
              )
            : ''}
        </p>
      )
    }),
    columnHelper.accessor({
      id: 'actions',
      header: () => '',
      cell: (time) => {
        const isShowEdit =
          time.user?.id === user.id && time.endTime && editTaskTracking

        const isShowDelete =
          time.user.id === user.id && time.taskId !== trackingTask?.id

        const isShowAddComment =
          time.user.id === user.id && !time.comment && time.endTime

        return editEndTimeId === time.id ? (
          <div className={'iconContainer'}>
            <Close
              className={'w-4 h-4 icon'}
              onClick={() => {
                setEditCommentId(null)
                setEditEndTimeId(null)
              }}
            />
          </div>
        ) : (
          <Popover open={open} onOpenChange={() => setOpen(!open)}>
            <Popover.Trigger
              className={classNames(
                'hover:bg-hover h-8 w-8 flex items-center justify-center'
              )}
            >
              <VerticalDots className={'icon w-4 h-4'} />
            </Popover.Trigger>
            <Popover.Content
              side='bottom'
              align='end'
              className='flex flex-col gap-2 w-max'
            >
              {isShowEdit && (
                <Item
                  onClick={() => {
                    setOpen(false)
                    editEndTimeId === time.id
                      ? resetState()
                      : handleEditEndTime(time)
                  }}
                  text={t('edit', { ns: TRANSLATION })}
                  Icon={Edit}
                />
              )}

              {isShowAddComment && (
                <Item
                  onClick={() => {
                    setEditCommentId(time.id)
                    setOpen(false)
                  }}
                  text={t('addComment', { ns: TRANSLATION })}
                  Icon={Comment}
                />
              )}

              {isShowDelete && (
                <Item
                  onClick={async () => {
                    setOpen(false)
                    await deleteTimeHistoryAsync.mutateAsync(time)
                  }}
                  text={t('delete', { ns: TRANSLATION })}
                  Icon={Trash}
                  isDelete
                />
              )}
            </Popover.Content>
          </Popover>
        )
      }
    })
  ]
}

interface ItemProps {
  onClick: () => void
  text: string
  Icon: FC<SVGProps<SVGSVGElement>>
  isDelete?: boolean
}

const Item: FC<ItemProps> = ({ onClick, text, Icon, isDelete = false }) => {
  return (
    <div
      className={
        'flex h-fit p-2 gap-2 rounded-lg hover:cursor-pointer hover:bg-hover'
      }
      onClick={onClick}
    >
      <Icon className={classNames('w-4 h-4', isDelete ? 'iconRed' : 'icon')} />
      <p className={classNames('body-12', isDelete && 'text-systemRed')}>
        {text}
      </p>
    </div>
  )
}
