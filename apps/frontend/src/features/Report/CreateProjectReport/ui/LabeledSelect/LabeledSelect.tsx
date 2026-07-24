import { DateValue } from '@mantine/dates'
import classNames from 'classnames'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { REPORT_PERIOD_OPTIONS } from '@/features/Report/CreateProjectReport/const/period'
import { calculatePeriod } from '@/features/Report/CreateProjectReport/helpers/calculatePeriod'
import { DateRange } from '@/shared/types/time.interface'
import { DatePickerMantine } from '@/shared/ui/DatePickerMantine/DatePickerMantine'
import { Select } from '@/shared/ui/Select/Select'
import styles from './LabeledSelect.module.scss'


dayjs.extend(utc)

interface Props {
  value: string
  onChange: (value: string) => void
  onCustomDateChange?: (start: DateValue, end: DateValue) => void
}

export const LabeledSelect = ({
  onChange,
  value,
  onCustomDateChange
}: Props) => {
  const { t } = useTranslation()

  const [customRange, setCustomRange] = useState<DateRange>([null, null])

  const handleDateRangeChange = (dateRange: DateRange) => {
    if (Array.isArray(dateRange)) {
      setCustomRange(dateRange)
      const [start, end] = dateRange
      onCustomDateChange?.(
        start && dayjs(start).toDate(),
        end && dayjs(end).toDate()
      )
    }
  }

  const CUSTOM_PERIOD_KEY = 'report.createForm.periodSelect.custom'

  const handleSelectChange = (option: string) => {
    onChange(option)
    if (option !== CUSTOM_PERIOD_KEY) {
      setCustomRange([null, null])
    }
  }

  return (
    <div className='flex gap-2 w-full'>
      <Select value={value || ''} onValueChange={handleSelectChange}>
        <Select.Trigger
          className={classNames(
            styles.trigger,
            'body-14-16',
            !value || value === '' ? '!text-textSecond' : ''
          )}
          placeholder={t('report.createForm.periodSelect.placeholder')}
        >
          {!value || value === ''
            ? t('report.createForm.periodSelect.placeholder')
            : value === CUSTOM_PERIOD_KEY
            ? t(value)
            : `${t(value)} ${calculatePeriod(value)}`}
        </Select.Trigger>
        <Select.Portal container={document.body}>
          <Select.Content
            align='start'
            className={'body-14-16'}
            viewportProps={{ className: 'flex flex-col gap-1' }}
          >
            {REPORT_PERIOD_OPTIONS.map((time) => (
              <Select.Item key={time} value={time}>
                {time === CUSTOM_PERIOD_KEY
                  ? t(time)
                  : `${t(time)} ${calculatePeriod(time)}`}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>
      {value === CUSTOM_PERIOD_KEY && (
        <DatePickerMantine
          isRange
          onChange={handleDateRangeChange}
          value={customRange}
          classNamesOverride={{
            root: 'max-w-[480px] w-full',
            input: classNames('pl-0 h-[42px] body-14-16', styles.input)
          }}
        />
      )}
    </div>
  )
}
