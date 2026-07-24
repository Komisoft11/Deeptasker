import React from 'react'
import { useForm } from 'react-hook-form'
import { VerificationCodeInput, VerificationTimer } from '@/features/User'
import { useUsers } from '@/entities/User'
import { UserService } from '@/entities/User/services/user.service'
import { Button } from '@/shared/ui/Button/Button'


export const VerificationForm = () => {
  const codeForm = useForm<{ code: string }>({
    defaultValues: { code: '' }
  })

  const { cancelVerifyEmailAsync, verifyEmailAsync } = useUsers()

  const { handleSubmit, watch, clearErrors } = codeForm

  const codeValue = watch('code')

  const isDisabled = codeValue?.trim().length !== 6

  const handleSubmitVerify = async (data: { code: string }) => {
    await verifyEmailAsync.mutateAsync(data)
  }

  const handleCancelVerification = async () => {
    await cancelVerifyEmailAsync.mutateAsync()
  }

  const handleResendCode = async () => {
    await UserService.resendRequestUpdateEmail()
    clearErrors('code')
  }

  return (
    <form
      className={'max-w-[480px] w-full flex flex-col gap-2'}
      onSubmit={handleSubmit(handleSubmitVerify)}
    >
      <div className={'flex flex-col gap-2 items-center'}>
        <VerificationCodeInput form={codeForm} />{' '}
        <VerificationTimer onClick={handleResendCode} />
      </div>

      <div className={'flex gap-2'}>
        <Button
          styleButton={'outline'}
          type={'button'}
          className={'w-full body-14-16'}
          onClick={handleCancelVerification}
        >
          Отменить
        </Button>
        <Button
          styleButton={'filled'}
          type={'submit'}
          className={'w-full body-14-16'}
          disabled={isDisabled}
        >
          Отправить
        </Button>
      </div>
    </form>
  )
}
