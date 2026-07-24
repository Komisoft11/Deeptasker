import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'
import { FormField } from '@/entities/Safety'
import { VerificationForm } from '@/entities/Safety/ChangeEmail/VerificationForm/VerificationForm'
import { useUsers } from '@/entities/User'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'


interface FormValues {
  email: string
  previousEmail: string
}

export const ChangeEmail = observer(() => {
  const [isChangeEmail, setIsChangeEmail] = useState(false)
  const { requestUpdateEmailAsync } = useUsers()
  const { authStore } = useRootStore()
  const { t } = useTranslation([ENTITY, TRANSLATION])

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .strict()
      .required('Введите новый email')
      .email('Введите корректный email')
      .notOneOf([authStore.user.email], 'Введите новую почту')
  })

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: { email: '', previousEmail: authStore.user.email },
    resolver: yupResolver(validationSchema)
  })

  const handleChangeEmail = async (data: FormValues) => {
    await requestUpdateEmailAsync.mutateAsync(data)
    resetForm(data.email)
  }

  const resetForm = (newEmail?: string) => {
    reset({ email: '', previousEmail: newEmail ?? authStore.user.email })
    setIsChangeEmail(false)
  }

  const isPendingEmail = authStore.user.pendingEmail

  const labelText = isPendingEmail
    ? t('safety.enterCode', { ns: ENTITY })
    : t('safety.changeEmail', { ns: ENTITY })

  const labelDescription = isPendingEmail
    ? (t('safety.checkEmailAndEnterCode', { ns: ENTITY }) as string)
    : (((t('safety.enterEmailAndPasswords', { ns: ENTITY }) as string) +
        t('safety.emailConfirmationInfo', { ns: ENTITY })) as string)

  return (
    <HorizontalLayout
      isSettingsPage
      labelText={labelText}
      containerClassName={
        !isChangeEmail && !isPendingEmail ? 'items-center' : undefined
      }
      className={'max-w-[480px] w-full'}
      labelDescription={labelDescription}
    >
      <div className={'w-full'}>
        {isChangeEmail ? (
          <form
            className={'flex flex-col gap-4'}
            onSubmit={handleSubmit(handleChangeEmail)}
          >
            <FormField
              name='email'
              label='Новый email'
              placeholder='Введите новый email'
              control={control}
              error={errors.email?.message}
              isVisible={true}
            />

            <div className={'flex gap-2 max-w-[480px] w-full'}>
              <Button
                styleButton={'outline'}
                className={'w-1/2 h-10 body-14-16'}
                onClick={() => resetForm()}
                type={'button'}
              >
                {t('cancel', { ns: TRANSLATION })}
              </Button>
              <Button
                styleButton={'filled'}
                className={'w-1/2 px-3 h-10 body-14-16'}
                type={'submit'}
                disabled={!isValid}
              >
                {t('save', { ns: TRANSLATION })}
              </Button>
            </div>
          </form>
        ) : isPendingEmail ? (
          <VerificationForm />
        ) : (
          <Button
            styleButton={'filled'}
            colorButton={'dark'}
            className={'max-w-[120px] w-full body-14-16'}
            onClick={() => setIsChangeEmail(true)}
          >
            {t('change', { ns: TRANSLATION })}
          </Button>
        )}
      </div>
    </HorizontalLayout>
  )
})
