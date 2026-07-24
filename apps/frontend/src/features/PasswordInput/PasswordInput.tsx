import React, { FC, ReactNode, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  IPasswordValidations,
  StrengthIndicator,
  ValidationList
} from '@/features/PasswordInput/'
import { getInputGenerator } from '@/features/User/heplers/getInputGenerator'
import { HidePassword, ShowPassword } from '@/shared/assets/images/icons'
import { PLACEHOLDERS } from '@/shared/const/translation'
import styles from './PasswordInput.module.scss'


interface Props {
  form: UseFormReturn<any>
  children?: ReactNode
  validations: IPasswordValidations
  strength: StrengthIndicator
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const PasswordInput: FC<Props> = ({
  form,
  children,
  validations,
  strength,
  handleChange
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => setIsFocused(true)

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
      setIsFocused(false)
    }
  }

  const hasError = !!form.formState.errors.password
  const isDirty = form.formState.dirtyFields.password
  const isShowValidation = hasError || isDirty || isFocused

  const inputGenerator = getInputGenerator({ ...form })

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)

  const { t } = useTranslation(PLACEHOLDERS)

  return (
    <div className={'relative'}>
      <div className={styles.password}>
        {inputGenerator({
          name: 'password',
          type: showPassword ? 'text' : 'password',
          placeholder: t('password') as string,
          autoComplete: 'off',
          onChange: handleChange,
          onBlur: handleBlur,
          onFocus: handleFocus
        })}
        {showPassword ? (
          <HidePassword onClick={togglePasswordVisibility} />
        ) : (
          <ShowPassword onClick={togglePasswordVisibility} />
        )}
      </div>
      {children}

      {isFocused && (
        <ValidationList
          validations={validations}
          strength={strength}
          className={styles.validationList}
        />
      )}
    </div>
  )
}
