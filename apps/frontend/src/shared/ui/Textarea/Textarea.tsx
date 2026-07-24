import classNames from 'classnames'
import React, { ComponentPropsWithRef, forwardRef } from 'react'
import { FieldError, FieldErrorsImpl } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { SUPPORT } from '@/shared/const/translation'

interface Props extends ComponentPropsWithRef<'textarea'> {
  className?: string
  showCounter?: boolean
  value?: string
  containerClassName?: string
  errors?: FieldError | FieldErrorsImpl<any> | undefined
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      className,
      showCounter = true,
      value,
      containerClassName,
      errors,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation([SUPPORT])
    return (
      <div className={classNames('flex flex-col gap-1', containerClassName)}>
        <textarea
          ref={ref}
          className={classNames(
            'p-3 bg-hover rounded-lg resize-none border',
            'min-h-[80px] body-14-16 scrollbarContainerOnObjects w-full',
            errors &&
              'outline-systemRed outline !outline-1 focus:outline !focus:outline-1 focus:outline-systemRed',
            className
          )}
          value={value}
          {...props}
        />
        <div className={'flex justify-between w-full'}>
          {errors ? (
            <p className='text-systemRed body-12 w-max pl-2'>
              {t(errors?.message as unknown as string, { ns: SUPPORT })}
            </p>
          ) : (
            <div></div>
          )}
          {showCounter && (
            <span className='secondaryText body-10 self-end text-end'>
              {value?.length || 0} / {props.maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)
