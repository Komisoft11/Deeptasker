import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import styles from '@/features/User/SignInForm/SignInForm.module.scss'
import { AuthApiError } from '@/entities/Error'
import {
  IResetPasswordRequestDto,
  resetPasswordRequestSchema,
  useUsers
} from '@/entities/User'
import { ERRORS, PLACEHOLDERS, TRANSLATION } from '@/shared/const/translation'
import { AuthenticationNavigator } from '@/shared/lib/navigators/authentication.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'


export const ResetRequestForm = () => {
  const { resetPasswordRequestAsync } = useUsers()
  const navigate = useNavigate()

  const { t } = useTranslation([TRANSLATION, ERRORS, PLACEHOLDERS])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<IResetPasswordRequestDto>({
    resolver: yupResolver(resetPasswordRequestSchema)
  })

  const onResetPassword = async (data: IResetPasswordRequestDto) => {
    try {
      await resetPasswordRequestAsync.mutateAsync(data)
    } catch (e) {
      const error = new AuthApiError(e)

      if (error.isInvalidEmail()) {
        setError('email', {
          message: t('user.email', { ns: ERRORS }) as string
        })
      }
    }
  }

  const handleCancel = () => {
    navigate(AuthenticationNavigator.getLoginUrl())
  }

  return (
    <div className={'flex flex-col gap-4'}>
      <div className={'flex flex-col gap-4 max-w-[400px]'}>
        <div className={styles.text}>
          <h1>{t('resetPassword', { ns: TRANSLATION })}</h1>
          <p className='body-16 secondaryText'>
            {t('resetPasswordText', { ns: TRANSLATION })}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onResetPassword)}
        className={'flex flex-col gap-3'}
      >
        <Input
          {...register('email')}
          error={!!errors?.email?.message}
          helperText={t(errors?.email?.message || '', { ns: ERRORS }) as string}
          className={classNames(
            styles.input,
            errors.email?.message && styles.error
          )}
          placeholder={t('email', { ns: PLACEHOLDERS }) as string}
        />
        <div className={'flex gap-1'}>
          <Button
            styleButton={'outline'}
            type={'button'}
            className={'w-1/2 body-16'}
            onClick={handleCancel}
          >
            {t('cancel', { ns: TRANSLATION })}
          </Button>
          <Button
            styleButton={'filled'}
            type={'submit'}
            className={'w-1/2 body-16'}
          >
            {t('next', { ns: TRANSLATION })}
          </Button>
        </div>
      </form>
    </div>
  )
}
