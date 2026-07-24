import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { usePasswordValidation } from '@/features/PasswordInput'
import { PasswordInput } from '@/features/PasswordInput/PasswordInput'
import styles from '@/features/User/SignInForm/SignInForm.module.scss'
import { useUsers } from '@/entities/User'
import { setPasswordSchema } from '@/entities/User/lib/authSchema'
import { setPasswordFrom } from '@/entities/User/model/types/ResetPasswordFrom.interface'
import { ENTITY, PLACEHOLDERS, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { AuthenticationNavigator } from '@/shared/lib/navigators/authentication.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'


export const SetPasswordForm = observer(() => {
  const { resetValidation, validations, strength, handleChange } =
    usePasswordValidation()
  const {
    authStore: { candidateEmail, enteredResetCode }
  } = useRootStore()

  const { t } = useTranslation([TRANSLATION, ENTITY, PLACEHOLDERS])

  const { setPasswordAsync } = useUsers()
  const form = useForm<setPasswordFrom>({
    resolver: yupResolver(setPasswordSchema)
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = form

  if (!candidateEmail) {
    return <Navigate to={AuthenticationNavigator.getAuthUrl()} replace />
  }

  if (!enteredResetCode) {
    return (
      <Navigate
        to={AuthenticationNavigator.getResetPasswordVerifyUrl()}
        replace
      />
    )
  }

  const onSet = async (data: setPasswordFrom) => {
    if (data.password !== data.copyPassword) {
      setError('copyPassword', { message: 'пароли не совпадают' })
      return
    }

    await setPasswordAsync.mutateAsync({
      email: candidateEmail,
      password: data.password,
      code: enteredResetCode
    })

    resetValidation()
  }

  return (
    <div className={'flex flex-col gap-4'}>
      <div className={'flex flex-col gap-4'}>
        <div className={styles.text}>
          <h1>{t('newPassword', { ns: TRANSLATION })}</h1>
          <p className='body-16 secondaryText'>
            {t('newPasswordText', { ns: TRANSLATION })}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSet)} className={'flex flex-col gap-2'}>
        <PasswordInput
          form={form}
          validations={validations}
          strength={strength}
          handleChange={handleChange}
        >
          <Input
            {...register('copyPassword')}
            error={!!errors?.copyPassword?.message}
            helperText={
              errors?.copyPassword?.message
                ? (t(errors.copyPassword.message, { ns: ENTITY }) as string)
                : ''
            }
            className={classNames(
              styles.input,
              errors?.copyPassword?.message && styles.error
            )}
            placeholder={t('repeatPassword', { ns: PLACEHOLDERS }) as string}
            type={'password'}
          />
        </PasswordInput>
        <Button styleButton={'filled'} type={'submit'}>
          {t('next', { ns: TRANSLATION })}
        </Button>
      </form>
    </div>
  )
})
