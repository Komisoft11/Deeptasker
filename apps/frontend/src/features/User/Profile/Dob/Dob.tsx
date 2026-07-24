import React, { FC } from 'react'
import { Control, useController } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { SHORT_DAY_FORMAT } from '@/shared/const/date_format'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { DatePickerMantine } from '@/shared/ui/DatePickerMantine/DatePickerMantine'

interface Props {
  control: Control<any>
  resetField: any
}

export const Dob: FC<Props> = ({ control, resetField }) => {
  const { t } = useTranslation([TRANSLATION, ENTITY])
  const { field } = useController({
    name: 'dob',
    control
  })

  return (
    <div className={'flex border-b border-border gap-6 py-6'}>
      <div className={'flex flex-col gap-2 w-[480px]'}>
        <h4>{t('user.dob', { ns: ENTITY })}</h4>
        <p className={'secondaryText body-14-16'}>
          {t('optionalField', { ns: TRANSLATION })}
        </p>
      </div>
      <div className={'w-[564px] flex flex-col gap-2'}>
        <DatePickerMantine
          value={field.value ?? null}
          onChange={field.onChange}
          maxDate={new Date()}
          onClear={() => field.onChange(null)}
          valueFormat={SHORT_DAY_FORMAT}
          classNamesOverride={{
            wrapper: 'h-10',
            input: 'text-[14px] leading-4',
            section: 'h-max mr-1'
          }}
        />
      </div>
    </div>
  )
}
