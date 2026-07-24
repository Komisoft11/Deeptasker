import classNames from 'classnames'
import { DetailedHTMLProps, FC, InputHTMLAttributes } from 'react'
import {
  Control,
  Controller,
  UseFormClearErrors,
  UseFormReturn
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styles from '@/features/User/SignInForm/SignInForm.module.scss'
import { IAuthFormData, IAuthInput } from '@/entities/User'
import { ERRORS } from '@/shared/const/translation'
import { Input } from '@/shared/ui/Input/Input'


export type TextFormFields = 'firstName' | 'lastName' | 'email' | 'password'
type FormData = Pick<IAuthFormData, TextFormFields>
type KeyFormData = keyof FormData

type IAuth = Omit<IAuthInput<KeyFormData>, 'label'> &
  Partial<Pick<IAuthInput<KeyFormData>, 'label'>> &
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

interface InputFieldProps extends IAuth {
  control: Control<IAuthFormData>
  clearErrors: UseFormClearErrors<IAuthFormData>
}

const InputField: FC<InputFieldProps> = ({
  control,
  clearErrors,
  name,
  type,
  placeholder,
  label = '',
  onChange: customOnChange,
  ...props
}) => {
  const { t } = useTranslation([ERRORS])

  return (
    <Controller
      defaultValue=''
      control={control}
      name={name}
      render={({
        fieldState: { error },
        field: { onChange, ...fieldProps }
      }) => (
        <Input
          {...fieldProps}
          {...props}
          onChange={(e) => {
            onChange(e)
            clearErrors(name)
            customOnChange?.(e)
          }}
          type={type}
          label={label}
          error={!!error?.message}
          helperText={t(error?.message || '', { ns: ERRORS }) as string}
          className={classNames(styles.input, error?.message && styles.error)}
          placeholder={placeholder}
        />
      )}
    />
  )
}

export const getInputGenerator = (form: UseFormReturn<IAuthFormData>) => {
  const { control, clearErrors } = form

  return (props: IAuth) => (
    <InputField {...props} control={control} clearErrors={clearErrors} />
  )
}
