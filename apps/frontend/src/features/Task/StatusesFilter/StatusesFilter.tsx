import classNames from 'classnames'
import React, { FC, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useInputSearch } from '@/features/Search/lib/hooks/useInputSearch'
import { ITaskStatus } from '@/entities/Project'
import { CaretDown } from '@/shared/assets/images/icons'
import { nsObject } from '@/shared/lib/helpers/translation.helper'
import { Accordion } from '@/shared/ui/Accordion/Accordion'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { Input } from '@/shared/ui/Input/Input'
import styles from './StatusFilter.module.scss'


interface Props {
  statuses?: ITaskStatus[]
  maxDefault?: number
  onChange?: (statusIds: number[]) => void
  initialValue?: number[]
}

interface FormValues {
  [key: string]: boolean
}

export const StatusesFilter: FC<Props> = ({
  statuses = [],
  maxDefault = 5,
  onChange,
  initialValue = []
}) => {
  const { t } = useTranslation()

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)

  const { handleChangeInputSearch, filterItems } = useInputSearch<ITaskStatus>(
    statuses.map((status) => {
      status.name = t(status.name)
      return status
    }),
    ['name']
  )

  const { control, getValues } = useForm<FormValues>({
    values: statuses.reduce((acc, status) => {
      acc[status.id] = initialValue.includes(status.id)
      return acc
    }, {} as FormValues)
  })

  const handleTrigger = () => {
    setIsCollapsed((prevState) => !prevState)
  }

  const handleCheckboxChange = () => {
    const currentValues = getValues()
    const selectedStatusIds = Object.entries(currentValues)
      .filter(([_, value]) => value)
      .map(([key]) => parseInt(key))

    onChange?.(selectedStatusIds)
  }

  const isAccordion = statuses.length > maxDefault

  return (
    <>
      {isAccordion && (
        <Input
          onChange={handleChangeInputSearch}
          placeholder={'Поиск по статусам'}
        />
      )}
      <Accordion type={'multiple'}>
        <Accordion.Item
          value={'filter-status-accordion'}
          className={styles.status}
        >
          {isCollapsed &&
            filterItems.slice(0, 5).map((status) => (
              <Controller
                key={status.id}
                name={`${status.id}`}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label={status.name}
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      handleCheckboxChange()
                    }}
                    classNameLabel={'body-14-20'}
                  />
                )}
              />
            ))}
          <Accordion.Content className={styles.content}>
            {filterItems.map((status) => (
              <Controller
                key={status.id}
                name={`${status.id}`}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label={status.name}
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      handleCheckboxChange()
                    }}
                    classNameLabel={'body-14-20'}
                  />
                )}
              />
            ))}
          </Accordion.Content>
          {statuses.length > maxDefault && (
            <Accordion.Trigger
              onClick={handleTrigger}
              className={classNames(styles.trigger, 'body-14-16')}
            >
              <p>{t(isCollapsed ? 'expand' : 'collapse', nsObject())}</p>
              <CaretDown
                className={classNames(
                  'icon h-4 w-4',
                  !isCollapsed && 'rotate-180'
                )}
              />
            </Accordion.Trigger>
          )}
        </Accordion.Item>
      </Accordion>
    </>
  )
}
