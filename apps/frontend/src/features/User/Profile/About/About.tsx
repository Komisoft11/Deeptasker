import React from 'react'
import { Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ENTITY, PLACEHOLDERS } from '@/shared/const/translation'
import { Textarea } from '@/shared/ui/Textarea/Textarea'

interface Props {
  control: Control<any>
}

export const About = ({ control }: Props) => {
  const { t } = useTranslation([ENTITY, PLACEHOLDERS])
  return (
    <div className={'flex gap-6 py-6'}>
      <div className={'flex flex-col gap-2 w-[480px]'}>
        <h4>{t('user.about', { ns: ENTITY })}</h4>
        <p className={'secondaryText body-14-16'}>
          {t('aboutMe', { ns: PLACEHOLDERS })}
        </p>
      </div>
      <div className={'w-[564px] flex flex-col gap-2'}>
        <Controller
          name='description'
          control={control}
          render={({ field: { onChange, value } }) => (
            <Textarea
              maxLength={300}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t('user.about', { ns: ENTITY }) as string}
            />
          )}
        />
      </div>
    </div>
  )
}
