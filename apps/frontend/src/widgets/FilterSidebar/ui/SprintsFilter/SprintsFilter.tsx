import { CheckedState } from '@radix-ui/react-checkbox'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { SprintCheckboxes } from '@/entities/Sprint/ui/SprintFilterPopover/SprintCheckboxes/SprintCheckboxes'
import { CaretDown, Close } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { Popover } from '@/shared/ui/Popover/Popover'


interface Props {
  onChange: (newValue: number[]) => void
  value: number[]
}

type FormValues = {
  isAllChecked: CheckedState
}

export const SprintsFilter: FC<Props> = observer(({ onChange, value }) => {
  const { sprintStore } = useRootStore()
  const { sprints } = sprintStore

  const [open, setOpen] = useState(false)

  const allSprintIds = useMemo(
    () => sprints.map((sprint) => sprint.id),
    [sprints.length]
  )

  const { control, setValue } = useForm<FormValues>({
    defaultValues: {
      isAllChecked: value.length === sprints.length
    },
    mode: 'onChange'
  })

  const handleUpdateSprintFilter = (sprintIds: number[]) => {
    const isAllChecked = sprintIds.length === sprints.length

    onChange(isAllChecked ? allSprintIds : sprintIds)

    setValue('isAllChecked', isAllChecked)
  }

  const handleUpdateAllSprintsFilter = (checked: CheckedState) => {
    onChange(checked ? allSprintIds : [])
  }

  return (
    <Popover open={open} onOpenChange={() => setOpen(!open)}>
      <Popover.Trigger className='bg-objects rounded-lg hover:bg-hover px-3 py-1 h-10 flex justify-between'>
        {value.length === 0 ? (
          <p className='body-14-16 secondaryText'>Выберите спринт</p>
        ) : (
          <div className='body-14-16 flex gap-2 items-center'>
            <p className='secondaryText'>Спринтов:</p>
            <p className='px-3 py-2 bg-hover rounded-lg'>{value.length}</p>
          </div>
        )}
        <div className='flex items-center'>
          {value.length > 0 && (
            <div
              className='iconContainer'
              onClick={() => handleUpdateSprintFilter([])}
            >
              <Close className='icon w-4 h-4' />
            </div>
          )}
          <CaretDown
            className={classNames('icon w-4 h-4', open && 'rotate-180')}
          />
        </div>
      </Popover.Trigger>
      <Popover.Content
        side='bottom'
        align='start'
        className='flex flex-col gap-2 w-[280px]'
      >
        <Controller
          name={'isAllChecked'}
          control={control}
          render={({ field: { onChange, value } }) => (
            <label
              className='flex justify-between hover:bg-hover cursor-pointer rounded-lg px-3 py-2 items-center'
              htmlFor='choose-all'
            >
              <p className='body-14-16'>Выбрать все</p>
              <Checkbox
                id='choose-all'
                checked={value}
                onCheckedChange={(checked) => {
                  onChange(checked)
                  handleUpdateAllSprintsFilter(checked)
                }}
              />
            </label>
          )}
        />
        <SprintCheckboxes
          sprints={sprints}
          onChange={handleUpdateSprintFilter}
          initialSprintsIds={value}
        />
      </Popover.Content>
    </Popover>
  )
})
