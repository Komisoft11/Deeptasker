import classNames from 'classnames'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TaskPriority, arrayOfPriorities } from '@/entities/Task'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import styles from './PriorityFilter.module.scss'

interface Props {
  onChange?: (priorities: number[]) => void
  initialPriorities?: number[]
}

interface FormValues {
  none: boolean
  high: boolean
  medium: boolean
  low: boolean
}

export const PrioritiesFilter = ({
  onChange,
  initialPriorities = []
}: Props) => {
  const { t } = useTranslation()

  const { control, getValues } = useForm<FormValues>({
    values: {
      none: initialPriorities.includes(0),
      high: initialPriorities.includes(3),
      medium: initialPriorities.includes(2),
      low: initialPriorities.includes(1)
    }
  })

  const handleCheckboxChange = () => {
    const currentValues = getValues()

    const selectedPriorities = Object.entries(currentValues).reduce(
      (acc, entry: [string, boolean]) => {
        if (entry[1]) {
          const index: number = arrayOfPriorities.indexOf(
            entry[0] as TaskPriority
          )

          if (index !== -1) {
            acc.push(index)
          }
        }

        return acc
      },
      [] as number[]
    )

    onChange?.(selectedPriorities)
  }

  return (
    <div className={styles.priorities}>
      <Controller
        name='none'
        control={control}
        render={({ field }) => (
          <Checkbox
            label={t('priorities.none')}
            className={styles.priority}
            classNameLabel={classNames(styles.label, 'body-14-20')}
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked)
              handleCheckboxChange()
            }}
          />
        )}
      />
      <Controller
        name='high'
        control={control}
        render={({ field }) => (
          <Checkbox
            label={t('priorities.high')}
            className={styles.priority}
            classNameLabel={classNames(styles.label, 'body-14-20')}
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked)
              handleCheckboxChange()
            }}
          />
        )}
      />
      <Controller
        name='medium'
        control={control}
        render={({ field }) => (
          <Checkbox
            label={t('priorities.medium')}
            className={styles.priority}
            classNameLabel={classNames(styles.label, 'body-14-20')}
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked)
              handleCheckboxChange()
            }}
          />
        )}
      />
      <Controller
        name='low'
        control={control}
        render={({ field }) => (
          <Checkbox
            label={t('priorities.low')}
            className={styles.priority}
            classNameLabel={classNames(styles.label, 'body-14-20')}
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked)
              handleCheckboxChange()
            }}
          />
        )}
      />
    </div>
  )
}
