import { observer } from 'mobx-react-lite'
import React, { FC, useEffect, useState } from 'react'
import { Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  nonDigitRegex,
  phoneNumberRegex
} from '@/features/User/Profile/PhoneNumber/consts'
import { Close } from '@/shared/assets/images/icons'
import {
  ENTITY,
  ERRORS,
  PLACEHOLDERS,
  TRANSLATION
} from '@/shared/const/translation'
import { Input } from '@/shared/ui/Input/Input'


interface Props {
  control: Control<any>
  defaultValue: string
}

const formatPhone = (phoneNumber: string): string => {
  const cleaned = ('' + phoneNumber).replace(nonDigitRegex, '')
  const match = cleaned.match(phoneNumberRegex)
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`
  }
  return phoneNumber
}

export const PhoneNumber: FC<Props> = observer(({ control, defaultValue }) => {
  const { t } = useTranslation([ENTITY, ERRORS, PLACEHOLDERS, TRANSLATION])
  const [formattedDefaultValue, setFormattedDefaultValue] =
    useState(defaultValue)

  const validatePhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (!cleaned) return true
    return (
      cleaned.length === 11 || (t('enterFullNumber', { ns: ERRORS }) as string)
    )
  }

  useEffect(() => {
    setFormattedDefaultValue(formatPhone(defaultValue))
  }, [defaultValue])

  return (
    <div className={'flex border-b border-objects gap-6 py-6'}>
      <div className={'flex flex-col gap-2 w-[480px]'}>
        <h4>{t('user.phone', { ns: ENTITY })}</h4>
        <p className={'secondaryText body-14-16'}>
          {t('phoneHint', { ns: TRANSLATION })}
        </p>
      </div>
      <div className={'w-[564px] flex flex-col gap-2'}>
        <Controller
          name='phoneNumber'
          control={control}
          defaultValue={formattedDefaultValue}
          rules={{
            validate: validatePhoneNumber
          }}
          render={({
            field: { onChange, value, onBlur },
            fieldState: { error }
          }) => (
            <div className={'flex flex-col gap-1'}>
              <Input
                type='tel'
                value={formatPhone(value) || ''}
                onChange={(e) => {
                  const formattedValue = formatPhone(
                    e.target.value.replace(nonDigitRegex, '')
                  )
                  onChange(formattedValue)
                }}
                onBlur={onBlur}
                placeholder={t('phone', { ns: PLACEHOLDERS }) as string}
                maxLength={18}
                containerClassName={'pr-1'}
              >
                {value != '' && (
                  <div className={'iconContainer'} onClick={() => onChange('')}>
                    <Close className={'icon w-4 h-4'} />
                  </div>
                )}
              </Input>
              {error && (
                <p className='text-systemRed body-12'>{error.message}</p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )
})