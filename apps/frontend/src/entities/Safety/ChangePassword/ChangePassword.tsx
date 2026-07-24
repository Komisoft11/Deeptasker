import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ValidationList, usePasswordValidation } from '@/features/PasswordInput'
import { AuthApiError } from '@/entities/Error'
import { FormField, changePasswordSchema } from '@/entities/Safety'
import { useUsers } from '@/entities/User'
import {
  ENTITY,
  ERRORS,
  PLACEHOLDERS,
  TRANSLATION
} from '@/shared/const/translation'
import { Button } from '@/shared/ui/Button/Button'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'


interface FormValues {
  password: string
  newPassword: string
  confirmPassword: string
}

export const ChangePassword = () => {
  const { updatePasswordAsync } = useUsers()
  const { validations, strength, handleChange, resetValidation } =
    usePasswordValidation()
  const [isChangePassword, setIsChangePassword] = useState(false)
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({
    password: false,
    newPassword: false,
    confirmPassword: false
  })

  const { t } = useTranslation([TRANSLATION, ERRORS, ENTITY, PLACEHOLDERS])

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    setError,
    reset
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: { password: '', newPassword: '', confirmPassword: '' },
    resolver: yupResolver(changePasswordSchema)
  })

  const togglePasswordVisibility = (field: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleChangePassword = async (data: FormValues) => {
    const { confirmPassword, ...submittedData } = data
    try {
      await updatePasswordAsync.mutateAsync(submittedData)
      resetForm()
    } catch (e) {
      const error = new AuthApiError(e)

      if (error.isPasswordIncorrect()) {
        setError('password', {
          message: t('invalidPassword', { ns: ERRORS }) as string
        })
      }
    }
  }

  const resetForm = () => {
    resetValidation()
    setIsChangePassword(false)
    reset()
  }

  return (
    <HorizontalLayout
      isSettingsPage
      labelText={t('safety.changePassword', { ns: ENTITY })}
      containerClassName={!isChangePassword ? 'items-center' : undefined}
      className={classNames(
        'max-w-[480px] w-full',
        isChangePassword && '!h-[260px]'
      )}
      labelDescription={
        t('safety.changePasswordDescription', { ns: ENTITY }) as string
      }
      containerChildren={
        isChangePassword && (
          <ValidationList
            strength={strength}
            validations={validations}
            className={'border border-border p-3 rounded-lg '}
          />
        )
      }
    >
      <div className={'w-full'}>
        {isChangePassword ? (
          <form
            className={'flex flex-col gap-4'}
            onSubmit={handleSubmit(handleChangePassword)}
          >
            <div className={'flex flex-col gap-3'}>
              <FormField
                name='password'
                label={t('labels.currentPassword', { ns: TRANSLATION })}
                placeholder={t('newPassword', { ns: PLACEHOLDERS })}
                control={control}
                error={errors.password?.message}
                isVisible={showPassword.password}
                onVisibilityToggle={() => togglePasswordVisibility('password')}
              />

              <FormField
                name='newPassword'
                label={t('labels.newPassword', { ns: TRANSLATION })}
                placeholder={t('repeatNewPassword', { ns: PLACEHOLDERS })}
                control={control}
                error={errors.newPassword?.message}
                isVisible={showPassword.newPassword}
                onVisibilityToggle={() =>
                  togglePasswordVisibility('newPassword')
                }
                onPasswordChange={handleChange}
              />

              <FormField
                name='confirmPassword'
                label={t('labels.repeatNewPassword', { ns: TRANSLATION })}
                placeholder={t('repeatPassword', { ns: PLACEHOLDERS })}
                control={control}
                error={errors.confirmPassword?.message}
                isVisible={showPassword.confirmPassword}
                onVisibilityToggle={() =>
                  togglePasswordVisibility('confirmPassword')
                }
              />
            </div>
            <div className={'flex gap-2 max-w-[480px] w-full'}>
              <Button
                styleButton={'outline'}
                className={'w-1/2 h-10 body-14-16'}
                onClick={resetForm}
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
        ) : (
          <Button
            styleButton={'filled'}
            colorButton={'dark'}
            className={'max-w-[120px] w-full body-14-16'}
            onClick={() => setIsChangePassword(true)}
          >
            {t('change', { ns: TRANSLATION })}
          </Button>
        )}
      </div>
    </HorizontalLayout>
  )
}
