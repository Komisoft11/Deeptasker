import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { usePasswordValidation } from '@/features/PasswordInput'
import { PasswordInput } from '@/features/PasswordInput/PasswordInput'
import styles from '@/features/User/SignInForm/SignInForm.module.scss'
import {
  TextFormFields,
  getInputGenerator
} from '@/features/User/heplers/getInputGenerator'
import { AuthApiError } from '@/entities/Error'
import { IAuthFormData, signUpSchema, useUsers } from '@/entities/User'
import { legalTab } from '@/shared/config/route.config'
import {
  ENTITY,
  ERRORS,
  PLACEHOLDERS,
  TRANSLATION
} from '@/shared/const/translation'
import { AuthenticationNavigator } from '@/shared/lib/navigators/authentication.navigator'
import { LegalNavigator } from '@/shared/lib/navigators/legal.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'


export const SignUpForm = () => {
  const navigate = useNavigate()
  const { resetValidation, validations, strength, handleChange } =
    usePasswordValidation()
  const { registrationAsync } = useUsers()
  const { t } = useTranslation([TRANSLATION, ENTITY, PLACEHOLDERS, ERRORS])
  const allValid = Object.values(validations).every((value) => value === true)

  const form = useForm<IAuthFormData>({
    resolver: yupResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      hasPoliciesAgreement: false
    }
  })

  const {
    handleSubmit,
    setError,
    formState: { isValid },
    control
  } = form

  const onRegistration = async (data: IAuthFormData) => {
    try {
      await registrationAsync.mutateAsync(data)
      resetFormState()
    } catch (e) {
      const error = new AuthApiError(e)

      if (error.isAlreadyRegistered()) {
        setError('email', {
          message: t('user.exist', { ns: ERRORS }) as string
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
  const inputGenerator = getInputGenerator({ ...form })

  const createInput = (
    name: TextFormFields,
    placeholder: string,
    autoComplete?: string
  ) =>
    inputGenerator({
      name,
      placeholder,
      autoComplete
    })

  const navigateToLogin = () => {
    form.reset()
    resetFormState()
    navigate(AuthenticationNavigator.getLoginUrl(), { replace: true })
  }

  const resetFormState = () => {
    resetValidation()
  }

  const isButtonDisabled = !allValid || !isValid

  return (
    <>
      <div className={'flex flex-col gap-4'}>
        <div className={styles.text}>
          <h1>{t('registration', { ns: TRANSLATION })}</h1>
          <p
            className='body-16 secondaryText'
            dangerouslySetInnerHTML={{
              __html: t('registrationText', { ns: TRANSLATION }) ?? ''
            }}
          />
        </div>
      </div>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit(onRegistration)}>
          <div className={'flex gap-2'}>
            {createInput('firstName', t('firstName', { ns: PLACEHOLDERS }))}
            {createInput('lastName', t('lastName', { ns: PLACEHOLDERS }))}
          </div>

          {createInput('email', t('email', { ns: PLACEHOLDERS }), 'off')}

          <PasswordInput
            form={form}
            validations={validations}
            strength={strength}
            handleChange={handleChange}
          />
          <Controller
            control={control}
            name={'hasPoliciesAgreement'}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                checked={value}
                onCheckedChange={(checked) => onChange(!!checked)}
                label={
                  <Trans
                    ns={TRANSLATION}
                    i18nKey={'consent'}
                    components={{
                      terms: (
                        <Link
                          to={LegalNavigator.getLegalTab({
                            tab: legalTab.TERMS_OF_USE
                          })}
                          className='accentText'
                        />
                      ),
                      policy: (
                        <Link
                          to={LegalNavigator.getLegalTab({
                            tab: legalTab.PRIVACY_POLICY
                          })}
                          className='accentText'
                        />
                      ),
                      consent: (
                        <Link
                          to={LegalNavigator.getLegalTab({
                            tab: legalTab.CONSENT
                          })}
                          className='accentText'
                        />
                      )
                    }}
                  />
                }
                className={'shrink-0'}
                containerClassName={'items-start h-max'}
                classNameLabel={'secondaryText body-12'}
              />
            )}
          />

          <Button
            className={'w-full'}
            type={'submit'}
            styleButton={'filled'}
            disabled={isButtonDisabled}
          >
            {t('register', { ns: TRANSLATION })}
          </Button>
          <div className={'body-12 text-center secondaryText gap-1'}>
            <p className='body-12 text-center secondaryText'>
              {t('user.alreadyRegistered', { ns: ENTITY })}{' '}
              <span onClick={navigateToLogin} className='accentText'>
                {t('signIn', { ns: TRANSLATION })}
              </span>
              {t('user.continueAfterSignIn', { ns: ENTITY })}
            </p>
          </div>
        </form>
      </div>
    </>
  )
}
