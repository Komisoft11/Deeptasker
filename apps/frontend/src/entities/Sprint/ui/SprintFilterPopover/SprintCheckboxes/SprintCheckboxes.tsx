import classNames from 'classnames'
import React, { FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { Sprint } from '@/entities/Sprint/model/sprint'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'

interface Props {
  sprints: Sprint[]
  onChange: (sprintIds: number[]) => void
  initialSprintsIds: number[]
}

type FormValues = {
  [key: string]: boolean
}

export const SprintCheckboxes: FC<Props> = ({
  sprints,
  onChange,
  initialSprintsIds
}) => {
  const { control, getValues } = useForm<FormValues>({
    values: sprints.reduce(
      (acc, sprint) => ({
        ...acc,
        [sprint.id]: initialSprintsIds.includes(sprint.id)
      }),
      {}
    )
  })

  const handleCheckboxChange = () => {
    const selectedSprintIds = Object.entries(getValues())
      .filter(([_, value]) => value)
      .map(([key]) => parseInt(key))
    onChange(selectedSprintIds)
  }

  return (
    <>
      {sprints.map((sprint) => (
        <Controller
          key={sprint.id}
          name={`${sprint.id}`}
          control={control}
          render={({ field }) => (
            <label
              className={classNames(
                'flex justify-between hover:bg-hover cursor-pointer rounded-lg px-3 py-2 items-center',
                field.value && 'bg-hover'
              )}
              htmlFor={`checkbox-${sprint.id}`}
            >
              <div className='flex flex-col gap-1 max-w-[75%]'>
                <p className='body-14-16'>{getSprintPeriod(sprint)}</p>
                <p className='body-12 secondaryText ellipsis'>{sprint.title}</p>
              </div>
              <Checkbox
                id={`checkbox-${sprint.id}`}
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked)
                  handleCheckboxChange()
                }}
              />
            </label>
          )}
        />
      ))}
    </>
  )
}

function getSprintPeriod(sprint: Sprint) {
  return `${formatDateTime({
    date: sprint.dateStart,
    includeTime: false
  })} - ${formatDateTime({ date: sprint.dateEnd, includeTime: false })}`
}
