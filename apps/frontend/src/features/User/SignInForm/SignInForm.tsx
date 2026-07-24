import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { getInputGenerator } from '@/features/User/heplers/getInputGenerator'
import { AuthApiError } from '@/entities/Error'
import { IAuthFormData, signInSchema, useUsers } from '@/entities/User'
import { HidePassword, ShowPassword } from '@/shared/assets/images/icons'
import {
  ENTITY,
  ERRORS,
  PLACEHOLDERS,
  TRANSLATION
} from '@/shared/const/translation'
import { AuthenticationNavigator } from '@/shared/lib/navigators/authentication.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'
import styles from './SignInForm.module.scss'


type FormData = Omit<IAuthFormData, 'name'>

export const SignInForm = () => {
  const navigate = useNavigate()
  const { t } = useTranslation([PLACEHOLDERS, ENTITY, ERRORS, TRANSLATION])

  const { loginAsync } = useUsers()

  const [showPassword, setShowPassword] = useState<boolean>(false)

  const form = useForm<FormData>({
    resolver: yupResolver(signInSchema),
    mode: 'onChange'
  })

  const { handleSubmit, setError } = form
  const inputGenerator = getInputGenerator({ ...form })
  const onLogin = async ({ email, password }: FormData) => {
    try {
      await loginAsync.mutateAsync({ email, password })
    } catch (e) {
      const error = new AuthApiError(e)

      if (error.isWrongEmailOrPassword() || error.isInvalidEmail()) {
        setError('email', {
          message: t('user.email', { ns: ERRORS }) as string
        })
        setError('password', {
          message: t('user.password', { ns: ERRORS }) as string
        })
        return
      }

      showToast({
        title: t('unknown', { ns: ERRORS }),
        text: t('tryAgainOrSupport', { ns: ERRORS }) as string,
        type: 'error'
      })
    }
  }

  const navigateToRegister = () => {
    form.reset()
    navigate(AuthenticationNavigator.getRegisterUrl(), { replace: true })
  }

  const navigateToPasswordReset = () => {
    navigate(AuthenticationNavigator.getResetPasswordRequestUrl(), {
      replace: true
    })
  }

  return (
    <>
      <div className={'flex flex-col gap-4'}>
        <div className={styles.text}>
          <h1>{t('login', { ns: TRANSLATION })}</h1>
          <p
            className='body-16 secondaryText'
            dangerouslySetInnerHTML={{
              __html: t('loginText', { ns: TRANSLATION }) ?? ''
            }}
          />
        </div>
      </div>
      <form className={styles.form} onSubmit={handleSubmit(onLogin)}>
        <div className={'flex flex-col gap-2'}>
          {inputGenerator({
            name: 'email',
            autoComplete: 'email',
            placeholder: t('email', { ns: PLACEHOLDERS }) as string
          })}
          <div className={styles.password}>
            {inputGenerator({
              name: 'password',
              autoComplete: 'current-password',
              type: !showPassword ? 'password' : 'text',
              placeholder: t('password', { ns: PLACEHOLDERS }) as string
            })}
            {!showPassword ? (
              <ShowPassword onClick={() => setShowPassword(!showPassword)} />
            ) : (
              <HidePassword onClick={() => setShowPassword(!showPassword)} />
            )}
          </div>
          <p
            className={'body-12 accentText w-full text-end cursor-pointer'}
            onClick={navigateToPasswordReset}
          >
            {t('forgotPassword', { ns: TRANSLATION })}
          </p>
        </div>
        <div className={'flex flex-col gap-2'}>
          <Button
            type={'submit'}
            className={'w-full'}
            styleButton={'filled'}
            disabled={!form.formState.isValid}
          >
            {t('enter', { ns: TRANSLATION })}
          </Button>

          <p className={'body-12 text-center secondaryText'}>
            {t('notRegisteredPrefix', { ns: TRANSLATION })}
            <span onClick={navigateToRegister} className={'accentText'}>
              {t('doRegister', { ns: TRANSLATION })}
            </span>{' '}
            {t('notRegisteredSuffix', { ns: TRANSLATION })}
          </p>
        </div>
      </form>
    </>
  )
}
