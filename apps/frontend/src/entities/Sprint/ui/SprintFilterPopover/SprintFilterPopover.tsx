import { CheckedState } from '@radix-ui/react-checkbox'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { NewSprintDialog } from '@/pages/Project/ProjectSprintsPage/NewSprintDialog/NewSprintDialog'
import { SprintCheckboxes } from '@/entities/Sprint/ui/SprintFilterPopover/SprintCheckboxes/SprintCheckboxes'
import { useTaskFilters } from '@/entities/Task'
import { CaretDown, Close, Plus } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { Popover } from '@/shared/ui/Popover/Popover'


type FormValues = {
  isAllChecked: CheckedState
}

export const SprintFilterPopover = observer(() => {
  const { sprintStore, taskFilterStore } = useRootStore()
  const [open, setOpen] = useState(false)
  const { appendFilters, removeFilter } = useTaskFilters()
  const { sprints } = sprintStore
  const [isAddSprint, setIsAddSprint] = useState(false)
  const { t } = useTranslation([ENTITY])

  const allSprintIds = useMemo(
    () => sprints.map((sprint) => sprint.id),
    [sprints.length]
  )

  const { control, setValue } = useForm<FormValues>({
    defaultValues: {
      isAllChecked:
        taskFilterStore.activeFiltersMap.sprintId.length === sprints.length
    },
    mode: 'onChange'
  })

  const [selectedSprintsIds, setSelectedSprintsIds] = useState<number[]>(
    taskFilterStore.activeFiltersMap.sprintId
  )

  const updateSprintFilter = (sprintIds: number[]) => {
    removeFilter('sprintId')

    if (sprintIds.length > 0) {
      appendFilters({ sprintId: sprintIds })
    }

    setSelectedSprintsIds(sprintIds)
  }

  const handleUpdateSprintFilter = (sprintIds: number[]) => {
    const isAllChecked = sprintIds.length === sprints.length

    updateSprintFilter(isAllChecked ? allSprintIds : sprintIds)

    setValue('isAllChecked', isAllChecked)
  }

  const handleUpdateAllSprintsFilter = (checked: CheckedState) => {
    updateSprintFilter(checked ? allSprintIds : [])
  }

  const isSprintsExists = sprints.length > 0

  return (
    <Popover open={open} onOpenChange={() => setOpen(!open)}>
      <Popover.Trigger className='w-[280px] bg-hover rounded-lg hover:bg-hover px-3 py-1 h-10 flex justify-between'>
        {selectedSprintsIds.length === 0 ? (
          <p className='body-14-16 secondaryText'>Выберите спринт</p>
        ) : (
          <div className='body-14-16 flex gap-2 items-center'>
            <p className='secondaryText'>Спринтов:</p>
            <p className='px-3 py-2 bg-hover rounded-lg'>
              {selectedSprintsIds.length}
            </p>
          </div>
        )}
        <div className='flex items-center'>
          {selectedSprintsIds.length > 0 && (
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
        {isSprintsExists && (
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
        )}

        <SprintCheckboxes
          sprints={sprints}
          onChange={handleUpdateSprintFilter}
          initialSprintsIds={selectedSprintsIds}
        />
        <Button
          styleButton={'filled'}
          className={'body-14-16'}
          icon={<Plus />}
          onClick={() => setIsAddSprint(true)}
        >
          {t('sprints.addSprint')}
        </Button>
        <NewSprintDialog
          isAddSprint={isAddSprint}
          setIsAddSprint={setIsAddSprint}
        />
      </Popover.Content>
    </Popover>
  )
})
