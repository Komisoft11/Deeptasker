import { DatePickerInput, DatesRangeValue } from '@mantine/dates'
import { DatePickerInputProps } from '@mantine/dates/lib/components/DatePickerInput/DatePickerInput'
import '@mantine/dates/styles.css'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@/shared/config/i18n/i18n'
import { WITHOUT_YEAR_FORMAT, WITH_DOTS } from '@/shared/const/date_format'
import { TRANSLATION } from '@/shared/const/translation'
import { useDatePickerPresets } from '@/shared/lib/hooks/useDatePickerPresets'
import { DateRange } from '@/shared/types/time.interface'
import classes from './DatePickerMantine.module.scss'


type InputClassNames = {
  wrapper?: string
  section?: string
  input?: string
  root?: string
  levelsGroup?: string
  calendarHeader?: string
  calendarHeaderControl?: string
  yearsList?: string
  monthsList?: string
  month?: string
  yearsListControl?: string
  monthsListControl?: string
  day?: string
  weekdaysRow?: string
  placeholder?: string
  presetList?: string
}

interface Props
  extends Pick<DatePickerInputProps, 'dropdownType' | 'popoverProps'> {
  isRange?: boolean
  value?: DateRange
  initialDate?: Date | null
  initialStartDate?: Date | null
  initialEndDate?: Date | null
  onChange?: (value: DateRange) => void
  classNamesOverride?: Partial<InputClassNames>
  minDate?: Date
  maxDate?: Date
  valueFormat?: string
  onClear?: () => void
  disabled?: boolean
  onDropdownClose?: () => void
}

type DateValue = string | DatesRangeValue<string> | null

export const DatePickerMantine = observer(
  ({
    isRange = false,
    value,
    initialDate = null,
    initialStartDate = null,
    initialEndDate = null,
    onChange,
    classNamesOverride,
    valueFormat: valueFormatProps,
    disabled = false,
    ...props
  }: Props) => {
    const { t } = useTranslation(TRANSLATION)
    const { defaultPresets, rangePresets } = useDatePickerPresets({
      minDate: props.minDate,
      maxDate: props.maxDate
    })

    const handleChange = (selectedValue: DateValue) => {
      let newValue: DateRange

      if (Array.isArray(selectedValue)) {
        newValue = selectedValue.map((v) =>
          v ? new Date(v) : null
        ) as DateRange
      } else {
        newValue = selectedValue ? new Date(selectedValue) : null
      }

      onChange?.(newValue)
    }

    const hasPresets = defaultPresets.length > 0 || rangePresets.length > 0

    const inputClassNames = {
      wrapper: classNames(
        classNamesOverride?.wrapper,
        classes.wrapper,
        disabled && 'bg-transparent border border-border'
      ),
      section: classNames(classes.section, classNamesOverride?.section),
      input: classNames(
        classNamesOverride?.input,
        classes.input,
        'body-12',
        disabled && 'pointer-events-none'
      ),
      root: classNamesOverride?.root,
      levelsGroup: classNames(
        classNamesOverride?.levelsGroup,
        hasPresets
          ? 'rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-none'
          : 'rounded-lg',
        classes.levelsGroup
      ),
      calendarHeader: classes.calendarHeader,
      calendarHeaderControl: classes.calendarHeaderControl,
      calendarHeaderControlIcon: classes.calendarHeaderControlIcon,
      yearsList: classes.list,
      monthsList: classes.list,
      month: classes.list,
      yearsListControl: classes.cell,
      monthsListControl: classes.cell,
      day: classes.cell,
      weekdaysRow: 'secondaryText body-14-16',
      placeholder: 'secondaryText',
      presetsList: classNames(
        hasPresets ? classes.presetsList : '',
        classNamesOverride?.presetList
      ),
      presetButton: classes.presetButton
    }

    const valueFormat = useMemo(() => {
      if (valueFormatProps) return valueFormatProps

      if (
        !isRange &&
        value instanceof Date &&
        dayjs(value).isValid() &&
        dayjs(value).year() === dayjs().year()
      ) {
        return WITHOUT_YEAR_FORMAT
      }

      return WITH_DOTS
    }, [valueFormatProps, isRange, value])

    return (
      <DatePickerInput
        locale={i18n.language}
        placeholder={t('selectDate') as string}
        value={
          value ?? (isRange ? [initialStartDate, initialEndDate] : initialDate)
        }
        onChange={handleChange}
        valueFormat={valueFormat}
        clearable={!disabled}
        monthsListFormat='MMMM'
        onDropdownClose={props.onDropdownClose}
        classNames={inputClassNames}
        type={isRange ? 'range' : 'default'}
        presets={isRange ? rangePresets : defaultPresets}
        {...(isRange ? { allowSingleDateInRange: true } : {})}
        {...props}
      />
    )
  }
)
