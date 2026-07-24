import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  GoalOption,
  RatingOption,
  UsabilityOption
} from '@/widgets/Settings/SettingsSupport/FeedbackForm/const/options'
import { feedbackFormSchema } from '@/widgets/Settings/SettingsSupport/FeedbackForm/lib/feedbackFormSchema'
import { TextareaQuestion } from '@/widgets/Settings/SettingsSupport/FeedbackForm/ui'
import { RadioQuestions } from '@/widgets/Settings/SettingsSupport/FeedbackForm/ui/RadioQuestions/RadioQuestions'
import { SupportService } from '@/entities/Support/services/support.service'
import { ERRORS, SUPPORT, TRANSLATION } from '@/shared/const/translation'
import { Button } from '@/shared/ui/Button/Button'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'


export interface FeedbackFormData {
  rating: string
  liked: string
  frustrating: string
  missingFeature: string
  usability: string
  goal: string
  extra: string
}

export const FeedbackForm = () => {
  const { t } = useTranslation([SUPPORT, TRANSLATION])
  const [isOtherSelected, setIsOtherSelected] = useState(false)
  const methods = useForm<FeedbackFormData>({
    mode: 'all',
    resolver: yupResolver(feedbackFormSchema),
    defaultValues: {
      rating: RatingOption.NORMAL,
      liked: '',
      frustrating: '',
      missingFeature: '',
      usability: UsabilityOption.NEUTRAL,
      goal: GoalOption.PERSONAL,
      extra: ''
    }
  })

  const handleSubmitFeedback = async (data: FeedbackFormData) => {
    await SupportService.sendFeedback(data)
      .then(() => {
        setIsOtherSelected(false)
        showToast({
          title: t('feedback.success', { ns: SUPPORT }),
          type: 'success'
        })
      })
      .catch((e) => {
        console.error(e)
        showToast({
          title: t('submitError', { ns: ERRORS }),
          type: 'error'
        })
      })
    methods.reset()
  }

  const isButtonDisabled =
    methods.formState.isSubmitting || !methods.formState.isValid

  return (
    <div className={'flex flex-col gap-4 px-1'}>
      <p className={'secondaryText body-14-16'}>
        {t('feedback.description', { ns: SUPPORT })}
      </p>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmitFeedback)}>
          <RadioQuestions name={'rating'} options={RatingOption} />
          <RadioQuestions
            name={'goal'}
            options={GoalOption}
            className={'flex-col'}
            isOtherSelected={isOtherSelected}
            setIsOtherSelected={setIsOtherSelected}
          />
          <TextareaQuestion name={'liked'} />
          <TextareaQuestion name={'frustrating'} />
          <TextareaQuestion name={'missingFeature'} />

          <RadioQuestions options={UsabilityOption} name={'usability'} />

          <TextareaQuestion name={'extra'} />

          <div className={'flex justify-center items-center w-full pt-4'}>
            <Button
              type={'submit'}
              styleButton={'filled'}
              colorButton={'accent'}
              className={'body-14-20 px-3'}
              disabled={isButtonDisabled}
            >
              {methods.formState.isSubmitting
                ? t('submitting', { ns: TRANSLATION })
                : t('feedback.submit', { ns: SUPPORT })}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
