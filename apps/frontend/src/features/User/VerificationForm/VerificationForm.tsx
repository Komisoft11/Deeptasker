import React, { FC } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import {
  VerificationCodeInput,
  VerificationTimer,
  useVerificationCode
} from '@/features/User'
import { AuthApiError } from '@/entities/Error'
import { TRANSLATION } from '@/shared/const/translation'
import { maskEmail } from '@/shared/helpers/maskEmail'
import { nsObject } from '@/shared/lib/helpers/translation.helper'
import { AuthenticationNavigator } from '@/shared/lib/navigators/authentication.navigator'
import { Button } from '@/shared/ui/Button/Button'
import styles from './VerificationForm.module.scss'


interface Props {
  candidateEmail: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
}

export const VerificationForm: FC<Props> = ({
  candidateEmail,
  onVerify,
  onResend
}) => {
  const { t } = useTranslation(TRANSLATION)

  const form = useForm<{ code: string }>({
    defaultValues: { code: '' }
  })

  const { resetVerificationCode } = useVerificationCode({ form: form })

  const { handleSubmit, setError, clearErrors, watch } = form

  const codeValue = watch('code')

  const isDisabled = codeValue?.trim().length !== 6

  if (!candidateEmail) {
    return <Navigate to={AuthenticationNavigator.getAuthUrl()} replace />
  }

  const handleResendCode = async () => {
    if (!candidateEmail) {
      return
    }

    await onResend()

    clearErrors('code')
  }

  const onSubmit = async (data: { code: string }) => {
    try {
      if (data.code) {
        await onVerify(data.code)
        resetVerificationCode()
      }
    } catch (e) {
      const error = new AuthApiError(e)

      if (error.isInvalidVerificationCode()) {
        setError('code', {
          type: 'manual',
          message: 'Неправильный код'
        })
      }
    }
  }

  return (
    <>
      <div className={'flex flex-col gap-4'}>
        <div className={styles.text}>
          <h1>{t('verification', nsObject())}</h1>
          <p
            className='body-16 secondaryText'
            dangerouslySetInnerHTML={{
              __html: `${t('verificationText', nsObject())} ${maskEmail(
                candidateEmail as string
              )} `
            }}
          />
        </div>
      </div>
      <form
        className={'flex flex-col gap-6 max-w-[400px]'}
        onSubmit={handleSubmit(onSubmit)}
      >
        <VerificationCodeInput form={form} />
        <div className={'flex flex-col gap-2 items-center w-full'}>
          <Button
            styleButton={'filled'}
            className={'w-full'}
            type='submit'
            disabled={isDisabled}
          >
            {t('send')}
          </Button>
          <VerificationTimer onClick={handleResendCode} />
        </div>
      </form>
    </>
  )
}
