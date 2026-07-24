import { FC, useCallback } from 'react'
import { DateRange } from '@/shared/types/time.interface'
import { DatePickerMantine } from '@/shared/ui/DatePickerMantine/DatePickerMantine'

interface IDateFilterProps {
  value: DateRange
  onChange?: (rangeDate: DateRange) => void
  maxDate?: Date
}

export const DateFilter: FC<IDateFilterProps> = ({
  value,
  onChange,
  maxDate
}) => {
  const initialStartDate = Array.isArray(value) ? value[0] : value
  const initialEndDate = Array.isArray(value) ? value[1] : null

  const handleClear = useCallback(() => {
    onChange?.(null)
  }, [onChange])

  const handleChange = useCallback(
    (dates: DateRange | null) => {
      if (!Array.isArray(dates)) {
        handleClear()
        return
      }

      const [start, end] = dates
      let adjustedStart = adjustToStartOfDay(start)
      let adjustedEnd = adjustToStartOfDay(end)

      if (adjustedStart?.getTime() === adjustedEnd?.getTime()) {
        adjustedEnd = adjustToEndOfDay(adjustedEnd)
      }

      onChange?.([adjustedStart, adjustedEnd])
    },
    [onChange]
  )

  return (
    <div className={'w-full flex flex-col gap-1'}>
      <DatePickerMantine
        isRange
        classNamesOverride={{ input: '!text-[14px] !leading-[20px]' }}
        maxDate={maxDate}
        onChange={handleChange}
        initialStartDate={initialStartDate}
        initialEndDate={initialEndDate}
        onClear={handleClear}
      />
    </div>
  )
}

function adjustToStartOfDay(date: Date | null): Date | null {
  if (!date) return null
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

function adjustToEndOfDay(date: Date | null): Date | null {
  if (!date) return null
  const newDate = new Date(date)
  newDate.setHours(23, 59, 59, 999)
  return newDate
}
