import classNames from 'classnames'
import React, { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useVerificationCode } from '@/features/User'
import { Input } from '@/shared/ui/Input/Input'
import styles from './VerificationCodeInput.module.scss'

interface Props {
  form: UseFormReturn<{ code: string }>
}

export const VerificationCodeInput: FC<Props> = ({ form }) => {
  const { code, handleInputChange, inputRefs, handlePaste, handleKeyDown } =
    useVerificationCode({ form: form })

  return (
    <div className={'flex flex-col gap-1'}>
      <div className={'flex gap-2'}>
        {code.map((_, index) => (
          <Input
            {...form.register('code')}
            key={index}
            className={classNames(
              styles.input,
              form.formState.errors.code && styles.errors
            )}
            inputClassName='text-center'
            maxLength={1}
            placeholder={'0'}
            value={code[index]}
            onPaste={(e) => handlePaste(e, index)}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputRefs.current[index] = el)}
            autoComplete={'off'}
          />
        ))}
      </div>
      {form.formState.errors.code && (
        <p className='body-12 text-systemRed'>
          {form.formState.errors.code.message}
        </p>
      )}
    </div>
  )
}
