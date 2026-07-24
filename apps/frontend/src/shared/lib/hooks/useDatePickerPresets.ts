import { DatePickerPreset } from '@mantine/dates'
import dayjs from 'dayjs'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DATE_PICKER_PRESET_FORMAT,
  DATE_PICKER_PRESET_WITH_TIME_FORMAT
} from '@/shared/const/date_format'
import { TRANSLATION } from '@/shared/const/translation'

type PresetsRange = {
  minDate?: Date
  maxDate?: Date
}

interface IReturn {
  defaultPresets: DatePickerPreset<'default'>[]
  rangePresets: DatePickerPreset<'range'>[]
}

export const useDatePickerPresets = (dates: PresetsRange): IReturn => {
  const { t } = useTranslation(TRANSLATION)

  const { minDate, maxDate } = dates

  const today = dayjs()

  const createDefaultPresets = useCallback(() => {
    const defaultPresets: DatePickerPreset<'default'>[] = [
      {
        value: today
          .subtract(1, 'year')
          .format(DATE_PICKER_PRESET_WITH_TIME_FORMAT),
        label: t('lastYear')
      },
      {
        value: today
          .subtract(1, 'month')
          .format(DATE_PICKER_PRESET_WITH_TIME_FORMAT),
        label: t('lastMonth')
      },
      {
        value: today
          .subtract(1, 'week')
          .format(DATE_PICKER_PRESET_WITH_TIME_FORMAT),
        label: t('lastWeek.title')
      },
      {
        value: today
          .subtract(1, 'day')
          .format(DATE_PICKER_PRESET_WITH_TIME_FORMAT),
        label: t('yesterday')
      },
      {
        value: today.format(DATE_PICKER_PRESET_WITH_TIME_FORMAT),
        label: t('today')
      },
      {
        value: today.add(1, 'day').format(DATE_PICKER_PRESET_WITH_TIME_FORMAT),
        label: t('tomorrow')
      },
      {
        value: today.add(1, 'week').format(DATE_PICKER_PRESET_WITH_TIME_FORMAT),
        label: t('nextWeek')
      },
      {
        value: today
          .add(1, 'month')
          .format(DATE_PICKER_PRESET_WITH_TIME_FORMAT),
        label: t('nextMonth')
      },
      {
        value: today.add(1, 'year').format(DATE_PICKER_PRESET_WITH_TIME_FORMAT),
        label: t('nextYear')
      }
    ]

    return defaultPresets.filter((preset) => {
      let isValid = true

      if (!minDate && !maxDate) {
        return isValid
      }

      if (minDate) {
        isValid = isValid && dayjs(preset.value).isAfter(minDate)
      }

      if (maxDate) {
        isValid = isValid && dayjs(preset.value).isBefore(maxDate)
      }

      return isValid
    })
  }, [minDate, maxDate])

  const createRangePresets = useCallback(() => {
    const defaultPresets: DatePickerPreset<'range'>[] = [
      {
        value: [
          today
            .subtract(1, 'year')
            .startOf('year')
            .format(DATE_PICKER_PRESET_FORMAT),
          today
            .subtract(1, 'year')
            .endOf('year')
            .format(DATE_PICKER_PRESET_FORMAT)
        ],
        label: t('lastYear')
      },
      {
        value: [
          today
            .subtract(1, 'month')
            .startOf('month')
            .format(DATE_PICKER_PRESET_FORMAT),
          today
            .subtract(1, 'month')
            .endOf('month')
            .format(DATE_PICKER_PRESET_FORMAT)
        ],
        label: t('lastMonth')
      },
      {
        value: [
          today
            .add(1, 'month')
            .startOf('month')
            .format(DATE_PICKER_PRESET_FORMAT),
          today.add(1, 'month').endOf('month').format(DATE_PICKER_PRESET_FORMAT)
        ],
        label: t('nextMonth')
      },
      {
        value: [
          today
            .add(1, 'year')
            .startOf('year')
            .format(DATE_PICKER_PRESET_FORMAT),
          today.add(1, 'year').endOf('year').format(DATE_PICKER_PRESET_FORMAT)
        ],
        label: t('nextYear')
      }
    ]

    return defaultPresets.filter((preset) => {
      let isValid = true

      if (!minDate && !maxDate) {
        return isValid
      }

      if (minDate) {
        isValid = isValid && dayjs(preset.value[0]).isAfter(minDate)
      }

      if (maxDate) {
        isValid = isValid && dayjs(preset.value[1]).isBefore(maxDate)
      }

      return isValid
    })
  }, [minDate, maxDate])

  return {
    defaultPresets: createDefaultPresets(),
    rangePresets: createRangePresets()
  }
}
