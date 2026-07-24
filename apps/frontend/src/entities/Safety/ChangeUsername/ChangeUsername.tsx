import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useUsers } from '@/entities/User'
import { UserService } from '@/entities/User/services/user.service'
import {
  ENTITY,
  ERRORS,
  PLACEHOLDERS,
  TRANSLATION
} from '@/shared/const/translation'
import { CANCEL, CREATE } from '@/shared/lib/helpers/shortcut.helper'
import useDebounce from '@/shared/lib/hooks/useDebounce'
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'


export const ChangeUsername = () => {
  const { authStore } = useRootStore()
  const { user } = authStore
  const { updateInformationAsync } = useUsers()
  const { t } = useTranslation([ENTITY, TRANSLATION, ERRORS, PLACEHOLDERS])

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<{ username: string }>({
    defaultValues: { username: user.username },
    mode: 'all'
  })

  const usernameValue = watch('username')
  const debouncedUsername = useDebounce(usernameValue, 300)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    if (!debouncedUsername) {
      setIsAvailable(null)
      return
    }

    let mounted = true

    UserService.checkUsername(debouncedUsername).then((result) => {
      if (mounted) setIsAvailable(result)
    })

    return () => {
      mounted = false
    }
  }, [debouncedUsername])

  const handleUpdateUsername = async (data: { username: string }) => {
    if (isAvailable) {
      await updateInformationAsync.mutateAsync(data)
      setIsAvailable(null)
      reset(data)
      inputRef.current?.blur()
    }
  }

  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleBlur = () => {
    inputRef.current?.blur()
    reset()
  }

  const usernameAvailability =
    isAvailable === null
      ? ''
      : isAvailable
      ? t('usernameAvailable', { ns: TRANSLATION })
      : t('user.usernameTaken', { ns: ERRORS })

  useKeyDown(inputRef, handleBlur, [CANCEL])

  return (
    <HorizontalLayout
      labelText={t('user.username', { ns: ENTITY })}
      className={'w-full max-w-[480px]'}
      isSettingsPage
    >
      <form className={'w-full'} onSubmit={handleSubmit(handleUpdateUsername)}>
        <Controller
          name={'username'}
          control={control}
          rules={{
            required: t('user.emptyUsername', { ns: ERRORS }) as string,
            minLength: {
              value: 3,
              message: t('user.minUsernameLength', { ns: ERRORS }) as string
            },
            pattern: {
              value: /^[a-zA-Z0-9._]*$/,
              message: t('user.usernamePattern', { ns: ERRORS }) as string
            }
          }}
          render={({ field: { value, onChange } }) => (
            <div className={'flex flex-col gap-1'}>
              <Input
                ref={inputRef}
                placeholder={'Введите новое имя пользователя'}
                className={'w-full max-w-[480px]'}
                onChange={(e) => {
                  const modifiedValue = e.target.value.replace(/\s+/g, '_')
                  onChange(modifiedValue)
                }}
                value={value}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              >
                {isFocused && (
                  <KbdElement
                    kdb={CREATE[0]}
                    tooltipContent={
                      t('kbd.changeUsername', { ns: TRANSLATION }) as string
                    }
                  />
                )}
              </Input>

              {errors.username && (
                <p className='body-12 text-systemRed pl-3'>
                  {errors.username.message}
                </p>
              )}

              {value &&
                value !== user.username &&
                isAvailable !== null &&
                !errors.username && (
                  <p
                    className={`body-12 pl-3 ${
                      isAvailable ? 'text-systemGreen' : 'text-systemRed'
                    }`}
                  >
                    {usernameAvailability}
                  </p>
                )}
            </div>
          )}
        />
      </form>
    </HorizontalLayout>
  )
}
