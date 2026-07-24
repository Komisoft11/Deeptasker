import classNames from 'classnames'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { BugFormData } from '@/widgets/Settings/SettingsSupport/BugForm/BugForm'
import { FeedbackFormData } from '@/widgets/Settings/SettingsSupport/FeedbackForm/FeedbackForm'
import {
  GoalOption,
  LocationOption,
  RatingOption,
  UsabilityOption
} from '@/widgets/Settings/SettingsSupport/FeedbackForm/const/options'
import { SUPPORT } from '@/shared/const/translation'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { Input } from '@/shared/ui/Input/Input'
import { RadioGroup, RadioOption } from '@/shared/ui/RadioGroup/RadioGroup'


type Options =
  | typeof RatingOption
  | typeof UsabilityOption
  | typeof GoalOption
  | typeof LocationOption

interface Props {
  options: Options
  name: keyof FeedbackFormData | keyof BugFormData
  className?: string
  isBugReport?: boolean
  isOtherSelected?: boolean
  setIsOtherSelected?: (isOtherSelected: boolean) => void
}

const OTHER = 'other'

export const RadioQuestions = ({
  options,
  name,
  className,
  isBugReport = false,
  isOtherSelected = false,
  setIsOtherSelected
}: Props) => {
  const { t } = useTranslation([SUPPORT])

  const {
    control,
    formState: { errors }
  } = useFormContext()

  const keyWord = isBugReport ? 'bugReport' : 'feedback'

  const mappedOptions: RadioOption[] = Object.values(options).map((value) => ({
    value,
    label: t(`${keyWord}.${name}.options.${value}`, { ns: SUPPORT })
  }))

  const hasOther = mappedOptions.some((o) => o.value === OTHER)

  const isShowInput = hasOther && isOtherSelected

  return (
    <HorizontalLayout
      labelText={t(`${keyWord}.${name}.label`, { ns: SUPPORT })}
      isSettingsPage
      className='max-w-[41%] w-full'
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const handleChange = (val: string) => {
            if (val === OTHER) {
              setIsOtherSelected?.(true)
              field.onChange('')
            } else {
              setIsOtherSelected?.(false)
              field.onChange(val)
            }
          }

          return (
            <div className='flex flex-col gap-2 justify-start w-full'>
              <RadioGroup
                className={classNames('flex gap-2 w-full', className)}
                value={isOtherSelected ? 'other' : field.value}
                onValueChange={handleChange}
              >
                <RadioGroup.Options
                  options={mappedOptions}
                  itemClassName='py-2 px-3 h-max w-max'
                  labelClassName='body-14-16'
                />
              </RadioGroup>

              {isShowInput && (
                <Input
                  containerClassName={classNames(
                    'max-w-[40%]',
                    errors[name] && '!outline-systemRed'
                  )}
                  placeholder={
                    t(`${keyWord}.${name}.placeholder`, {
                      ns: SUPPORT
                    }) as string
                  }
                  value={field.value}
                  autoFocus
                  maxLength={100}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
              {errors[name] && (
                <p className='text-systemRed body-12'>
                  {`${t(errors[name]?.message as string)}`}
                </p>
              )}
            </div>
          )
        }}
      />
    </HorizontalLayout>
  )
}
