import classNames from 'classnames'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  IPasswordValidations,
  StrengthIndicator
} from '@/features/PasswordInput'
import { StrengthBar } from '@/features/PasswordInput/ui/StrengthBar/StrengthBar'
import { Circle, CircleCancel, CircleCheck } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'

interface ValidationListProps {
  validations: IPasswordValidations
  strength: StrengthIndicator
  className?: string
}

export const ValidationList: FC<ValidationListProps> = ({
  validations,
  strength,
  className
}) => {
  const { t } = useTranslation(ENTITY)
  const validationMessages = [
    { key: 'onlyLatin', message: 'passwordStrength.requirements.onlyLatin' },
    { key: 'minLength', message: 'passwordStrength.requirements.minLength' },
    {
      key: 'hasBothCases',
      message: 'passwordStrength.requirements.upperLowerCase'
    },
    { key: 'hasSymbol', message: 'passwordStrength.requirements.specialChar' }
  ]

  return (
    <div className={classNames('flex flex-col gap-2 px-3', className)}>
      <div
        className={
          'secondaryText body-12 flex w-full justify-between gap-3 items-center'
        }
      >
        <p>{t('passwordStrength.title')} </p>
        <StrengthBar strength={strength} />

        <p className={'w-[56px] text-end'}>
          {t(`passwordStrength.strength.${strength}`)}
        </p>
      </div>
      <div className={'flex flex-col gap-3 pt-2 border-t border-border'}>
        <p className={'secondaryText body-12'}>
          {t('passwordStrength.description')}{' '}
        </p>
        <ul className='flex flex-col gap-2'>
          {validationMessages.map(({ key, message }) => (
            <li key={key} className='flex gap-1 items-center'>
              {validations[key as keyof typeof validations] === false ? (
                <CircleCancel className={'iconRed'} />
              ) : validations[key as keyof typeof validations] === null ? (
                <Circle />
              ) : (
                <CircleCheck className={'iconGreen'} />
              )}
              <p
                className={classNames('body-12', {
                  'text-systemGreen':
                    validations[key as keyof typeof validations],
                  'text-systemRed':
                    !validations[key as keyof typeof validations],
                  secondaryText:
                    validations[key as keyof typeof validations] === null
                })}
              >
                {t(message)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
