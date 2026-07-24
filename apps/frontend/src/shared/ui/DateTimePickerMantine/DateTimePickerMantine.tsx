import '@mantine/core/styles/Popover.css'
import { DateTimePicker, DateTimePickerProps, DateValue } from '@mantine/dates'
import '@mantine/dates/styles.css'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@/shared/config/i18n/i18n'
import { TRANSLATION } from '@/shared/const/translation'
import { useDatePickerPresets } from '@/shared/lib/hooks/useDatePickerPresets'
import classes from './DateTimePicker.module.scss'


type InputClassNames = {
  wrapper?: string
  section?: string
  input?: string
  root?: string
  levelsGroup?: string
  calendarHeader?: string
  calendarHeaderControl?: string
  calendarHeaderControlIcon?: string
  yearsList?: string
  monthsList?: string
  month?: string
  yearsListControl?: string
  monthsListControl?: string
  day?: string
  weekdaysRow?: string
  placeholder?: string
  popoverDropdown?: string
  timeWrapper?: string
  list?: string
  presetList?: string
  timeInput?: string
}

interface Props extends Omit<DateTimePickerProps, 'onChange'> {
  initialDate?: string | null
  onChange?: (value: string | null) => void
  classNamesOverride?: Partial<InputClassNames>
  minDate?: Date
  maxDate?: Date
  valueFormat?: string
  onClear?: () => void
  value?: DateValue
  onSubmitValue?: (value: string | null) => void
}

export const DateTimePickerMantine = observer(
  ({
    initialDate,
    onChange,
    classNamesOverride,
    valueFormat,
    value,
    onClear,
    onSubmitValue,
    ...props
  }: Props) => {
    const { t } = useTranslation(TRANSLATION)
    const { disabled } = props

    const [localValue, setLocalValue] = useState<string | null>(
      initialDate ?? null
    )

    const { defaultPresets } = useDatePickerPresets({
      minDate: props.minDate,
      maxDate: props.maxDate
    })

    const hasPresets = defaultPresets.length > 0

    const handleChangeLocal = (selectedValue: string | null) => {
      if (!selectedValue) {
        handleClearLocal()
        return
      }
      setLocalValue(selectedValue)
      onChange?.(selectedValue)
    }

    const handleCloseDropdown = () => {
      if (!dayjs(value).isSame(dayjs(initialDate))) {
        onSubmitValue?.(localValue)
      }
    }

    const handleClearLocal = () => {
      setLocalValue(null)
      onClear?.()
    }

    const inputClassNames = {
      popoverDropdown: classNames(
        classNamesOverride?.popoverDropdown,
        classes.wrapper
      ),
      wrapper: classNames(
        classNamesOverride?.wrapper,
        classes.wrapper,
        disabled && 'bg-transparent border border-border'
      ),
      section: classNames(classes.section, classNamesOverride?.section),
      input: classNames(classNamesOverride?.input, classes.input, 'body-12'),
      root: classNames(classNamesOverride?.root, classes.root),
      levelsGroup: classNames(
        classNamesOverride?.levelsGroup,
        classes.levelsGroup
      ),
      calendarHeader: classes.calendarHeader,
      calendarHeaderControl: classes.calendarHeaderControl,
      calendarHeaderControlIcon: classes.calendarHeaderControlIcon,
      yearsList: classNames(classes.list, classNamesOverride?.list),
      monthsList: classNames(classes.list, classNamesOverride?.list),
      month: classNames(classes.list, classNamesOverride?.list),
      yearsListControl: classes.cell,
      monthsListControl: classes.cell,
      day: classes.cell,
      weekdaysRow: 'secondaryText body-14-16',
      placeholder: 'secondaryText',
      timeWrapper: classNames(
        classNamesOverride?.timeWrapper,
        classes.timeWrapper,
        disabled && 'bg-transparent border border-border'
      ),
      submitButton: classes.submitButton,
      timeInput: classNames(classNamesOverride?.timeInput, classes.timeInput),
      presetsList: classNames(
        hasPresets ? classes.presetsList : '',
        classNamesOverride?.presetList
      ),
      presetButton: classes.presetButton
    }

    const timeClassNames = {
      fieldsGroup: classes.fieldsGroup,
      field: classes.field
    }

    return (
      <DateTimePicker
        locale={i18n.language}
        placeholder={t('selectDate') as string}
        clearable={!disabled}
        monthsListFormat='MMMM'
        classNames={inputClassNames}
        value={value ?? localValue}
        onChange={handleChangeLocal}
        onClick={(e) => e.stopPropagation()}
        onDropdownClose={handleCloseDropdown}
        valueFormat={valueFormat ?? 'DD.MM.YYYY HH:mm'}
        timePickerProps={{ classNames: timeClassNames }}
        presets={defaultPresets}
        {...props}
      />
    )
  }
)
