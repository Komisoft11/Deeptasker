import classNames from 'classnames'
import {
  ChangeEvent,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  FC,
  FormEvent,
  ReactNode,
  SVGProps,
  forwardRef,
  useImperativeHandle,
  useRef
} from 'react'
import './Input.scss'

interface Props extends ComponentPropsWithRef<'input'> {
  label?: ReactNode
  Icon?: FC<SVGProps<SVGSVGElement>>
  EndIcon?: FC<SVGProps<SVGSVGElement>>
  error?: boolean
  helperText?: string
  inputClassName?: string
  onEndIconClick?: () => void
  children?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      className,
      label,
      Icon,
      EndIcon,
      error = false,
      helperText,
      onChange,
      onInput,
      value: controlledValue,
      inputClassName,
      onEndIconClick,
      children,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const { disabled, readOnly } = props

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event)
    }

    const handleInput = (event: FormEvent<HTMLInputElement>) => {
      if (onInput) {
        onInput(event)
      }
    }

    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => inputRef.current!)

    const valueProps: Pick<ComponentPropsWithoutRef<'input'>, 'value'> = {
      value: controlledValue
    }

    return (
      <div
        className={classNames('DT_Input_Body', className)}
        onClick={() => inputRef.current?.focus()}
      >
        {label && (
          <label className={'body-12 secondaryText pl-1'}>{label}</label>
        )}
        <div
          className={classNames(
            'DT_Input_Container',
            disabled && 'disabled bg-transparent border-hover',
            EndIcon && 'pr-1',
            containerClassName
          )}
        >
          {Icon && <Icon className={'w-4 h-4 shrink-0 icon'} />}
          <input
            {...valueProps}
            ref={inputRef}
            onInput={handleInput}
            onChange={handleChange}
            className={classNames(
              'DT_Input_Input body-14-16',
              error ? 'DT_Input_Input-error' : null,
              inputClassName,
              readOnly && 'DT_Input_Input-readonly'
            )}
            {...props}
          />
          {EndIcon && (
            <div onClick={() => onEndIconClick?.()} className={'iconContainer'}>
              <EndIcon className={'w-4 h-4 shrink-0 icon'} />
            </div>
          )}
          {children && children}
        </div>

        {helperText && (
          <p className={'pl-3  text-[var(--system-red)] body-12'}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
