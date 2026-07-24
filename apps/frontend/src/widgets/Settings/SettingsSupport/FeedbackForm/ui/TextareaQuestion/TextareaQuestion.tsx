import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { BugFormData } from '@/widgets/Settings/SettingsSupport/BugForm/BugForm'
import { FeedbackFormData } from '@/widgets/Settings/SettingsSupport/FeedbackForm/FeedbackForm'
import { SUPPORT } from '@/shared/const/translation'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { Textarea } from '@/shared/ui/Textarea/Textarea'


interface Props {
  name: keyof FeedbackFormData | keyof BugFormData
  maxLength?: number
  isBugReport?: boolean
}

export const TextareaQuestion = ({
  name,
  maxLength = 300,
  isBugReport = false
}: Props) => {
  const { t } = useTranslation([SUPPORT])
  const {
    control,
    formState: { errors }
  } = useFormContext()
  const keyWord = isBugReport ? 'bugReport' : 'feedback'

  return (
    <HorizontalLayout
      labelText={t(`${keyWord}.${name}.label`, { ns: SUPPORT })}
      isSettingsPage
      className={'max-w-[41%] w-full'}
    >
      <div className={'w-full'}>
        <div className={'flex flex-col'}>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Textarea
                placeholder={
                  t(`${keyWord}.${name}.placeholder`, {
                    ns: SUPPORT
                  }) as string
                }
                containerClassName={'max-w-[70%] w-full'}
                maxLength={maxLength}
                errors={errors[name]}
                {...field}
              />
            )}
          />
        </div>
      </div>
    </HorizontalLayout>
  )
}
