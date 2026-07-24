import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTimeTabValidation } from '@/widgets/Task/TaskItem/TabsTaskItem/hooks/useTimeTabValidation'
import { timeSchema } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/AddTime/lib/timeSchema'
import styles from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/TimeTab.module.scss'
import { calculateTimeDifference } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/helpers/calculateTimeDifference'
import { useTimeHistory } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/hooks/useTimeHistory'
import { DATE_TIME_FULL_FORMAT } from '@/shared/const/date_format'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { DateTimePickerMantine } from '@/shared/ui/DateTimePickerMantine/DateTimePickerMantine'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'
import { Table } from '@/shared/ui/Table/Table'


interface Props {
  setIsAddTime: (isAddTime: boolean) => void
}

interface FormValues {
  comment: string
  endDate: string
  startDate: string
}

export const AddTime: FC<Props> = observer(({ setIsAddTime }) => {
  const {
    authStore: { user },
    taskStore: { activeTask }
  } = useRootStore()
  const { addTimeHistoryAsync } = useTimeHistory(activeTask)

  const validationFunctions = useTimeTabValidation()

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isValid },
    watch
  } = useForm<FormValues>({
    resolver: yupResolver(timeSchema(validationFunctions)),
    mode: 'all'
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const totalTime =
    startDate &&
    endDate &&
    calculateTimeDifference(dayjs(startDate).toDate(), dayjs(endDate).toDate())

  const onSubmit = async ({ startDate, endDate, comment }: FormValues) => {
    await addTimeHistoryAsync.mutateAsync({
      comment,
      startTime: dayjs(startDate).toDate(),
      endTime: dayjs(endDate).toDate()
    })
    setIsAddTime(false)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={'border-t border-b border-border pb-2'}
    >
      <Table.Row
        className={classNames(styles.tableRow, 'border-accent border-b')}
      >
        <Table.Cell>
          <p className={'body-14-16'}>
            {user.firstName} {user.lastName}
          </p>
        </Table.Cell>
        <Table.Cell>
          <Controller
            name='startDate'
            control={control}
            render={({ field }) => (
              <DateTimePickerMantine
                clearable={false}
                placeholder='Когда начали?'
                value={field.value}
                onChange={field.onChange}
                valueFormat={DATE_TIME_FULL_FORMAT}
                minDate={new Date(activeTask.dateCreated)}
                maxDate={new Date()}
              />
            )}
          />
        </Table.Cell>
        <Table.Cell>
          <Controller
            name='endDate'
            control={control}
            render={({ field: { value, onChange } }) => {
              return (
                <DateTimePickerMantine
                  clearable={false}
                  placeholder='Когда закончили?'
                  value={value}
                  onChange={onChange}
                  valueFormat={DATE_TIME_FULL_FORMAT}
                  minDate={startDate ? new Date(startDate) : undefined}
                  maxDate={new Date()}
                />
              )
            }}
          />
        </Table.Cell>
        <Table.Cell>{totalTime}</Table.Cell>
      </Table.Row>
      <div className={styles.comment}>
        <p className='py-1 body-12 secondaryText'>Комментарий</p>
        <div className='flex flex-col gap-1'>
          <Input
            {...register('comment')}
            className={
              errors.comment && 'outline-[1px] outline-systemRed rounded-lg'
            }
            placeholder={'Введите комментарий'}
          >
            <KbdElement kdb={'Enter'} tooltipContent={'Отправить'} />
          </Input>

          {!isValid && (
            <p className='body-12 text-systemRed'>
              {errors.comment?.message ||
                errors.startDate?.message ||
                errors.endDate?.message}
            </p>
          )}
        </div>
      </div>
    </form>
  )
})
