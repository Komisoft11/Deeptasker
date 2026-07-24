import React, { FC, useRef, useState } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HidePassword, ShowPassword } from '@/shared/assets/images/icons'
import { ERRORS } from '@/shared/const/translation'
import { Input } from '@/shared/ui/Input/Input'

interface FormFieldProps {
  name: string
  label: string
  placeholder: string
  control: UseFormReturn<any>['control']
  error: string | undefined
  isVisible?: boolean
  onVisibilityToggle?: () => void
  onPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FormField: FC<FormFieldProps> = ({
  name,
  label,
  placeholder,
  control,
  error,
  isVisible,
  onVisibilityToggle,
  onPasswordChange
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { t } = useTranslation([ERRORS])

  const handleFocus = () => setIsFocused(true)

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (
      containerRef.current &&
      e.relatedTarget &&
      containerRef.current.contains(e.relatedTarget as Node)
    ) {
      return
    }
    setIsFocused(false)
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <div
          ref={containerRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={-1}
          className={'max-w-[480px] w-full relative'}
        >
          <Input
            type={isVisible ? 'text' : 'password'}
            label={label}
            placeholder={placeholder}
            error={!!error}
            helperText={t(error || '') as string}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onChange(e)
              onPasswordChange?.(e)
            }}
          >
            {isFocused && onVisibilityToggle && (
              <PasswordVisibilityToggle
                isVisible={isVisible ?? false}
                onClick={onVisibilityToggle}
              />
            )}
          </Input>
        </div>
      )}
    />
  )
}

const PasswordVisibilityToggle: FC<{
  isVisible: boolean
  onClick: () => void
}> = ({ isVisible, onClick }) => {
  return isVisible ? (
    <HidePassword onClick={onClick} className={'w-5 h-5 icon cursor-pointer'} />
  ) : (
    <ShowPassword onClick={onClick} className={'w-5 h-5 icon cursor-pointer'} />
  )
}
