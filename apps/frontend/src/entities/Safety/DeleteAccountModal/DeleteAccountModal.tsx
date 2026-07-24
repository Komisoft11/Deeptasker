import React, { FC, SVGProps, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  VerificationCodeInput,
  VerificationTimer,
  useVerificationCode
} from '@/features/User'
import { useUsers } from '@/entities/User'
import { UserService } from '@/entities/User/services/user.service'
import { Attention, Email, Password, Trash } from '@/shared/assets/images/icons'
import { ENTITY, PLACEHOLDERS, TRANSLATION } from '@/shared/const/translation'
import { Button } from '@/shared/ui/Button/Button'
import { Dialog } from '@/shared/ui/Dialog/Dialog'
import { Input } from '@/shared/ui/Input/Input'


interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DeleteAccountModal: FC<Props> = ({ open, onOpenChange }) => {
  const [deleteMethod, setDeleteMethod] = useState<'code' | 'password' | null>(
    null
  )
  const { deleteAccountAsync } = useUsers()
  const { t } = useTranslation([ENTITY, PLACEHOLDERS])

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      handleReset()
    }
    onOpenChange(isOpen)
  }

  const passwordForm = useForm<{ password: string }>({
    defaultValues: { password: '' }
  })

  const codeForm = useForm<{ code: string }>({
    defaultValues: { code: '' }
  })

  const { resetVerificationCode } = useVerificationCode({
    form: codeForm
  })

  const codeValue = codeForm.watch('code')
  const passwordValue = passwordForm.watch('password')

  const onSubmitPassword = async (data: { password: string }) => {
    await deleteAccountAsync.mutateAsync(data)
    handleReset()
  }

  const onSubmitCode = async (data: { code: string }) => {
    await deleteAccountAsync.mutateAsync(data)
    handleReset()
  }

  const handleReset = () => {
    setDeleteMethod(null)
    passwordForm.reset()
    codeForm.reset()
    resetVerificationCode()
  }

  const handleRequestCode = async () => {
    setDeleteMethod('code')
    await handleResendCode()
  }

  const handleResendCode = async () => {
    await UserService.requestCodeForAccountDelete()
  }

  const modalTitle =
    deleteMethod === 'password'
      ? t('safety.deleteByPassword', { ns: ENTITY })
      : deleteMethod === 'code'
      ? t('safety.deleteByCode', { ns: ENTITY })
      : t('safety.deleteAccountConfirmationMethod', { ns: ENTITY })

  return (
    <Dialog onOpenChange={handleModalClose} open={open}>
      <Dialog.Content title={modalTitle} className={'h-max max-w-[650px]'}>
        <div className={'flex flex-col'}>
          <div className={'flex flex-col gap-6'}>
            {!deleteMethod && (
              <div className={'w-full flex gap-2'}>
                <DeleteMethod
                  title={t('safety.byPassword', { ns: ENTITY })}
                  description={t('safety.byPasswordDescription', {
                    ns: ENTITY
                  })}
                  onclick={() => setDeleteMethod('password')}
                  Icon={Password}
                />
                <DeleteMethod
                  title={t('safety.byEmail', { ns: ENTITY })}
                  description={t('safety.byEmailDescription', { ns: ENTITY })}
                  onclick={handleRequestCode}
                  Icon={Email}
                />
              </div>
            )}
            {deleteMethod === 'password' && (
              <form
                className='flex flex-col gap-6'
                onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              >
                <Input
                  {...passwordForm.register('password')}
                  placeholder={
                    t('accountPassword', { ns: PLACEHOLDERS }) as string
                  }
                  type='password'
                  autoComplete={'new-password'}
                />
                <Warning />
                <ButtonGroup
                  handleReset={handleReset}
                  submitDisabled={!passwordValue.trim().length}
                />
              </form>
            )}
            {deleteMethod === 'code' && (
              <form
                className='flex flex-col gap-6'
                onSubmit={codeForm.handleSubmit(onSubmitCode)}
              >
                <div className={'flex flex-col gap-2 items-center'}>
                  <VerificationCodeInput form={codeForm} />
                  <VerificationTimer onClick={handleResendCode} />
                </div>

                <Warning />
                <ButtonGroup
                  handleReset={handleReset}
                  submitDisabled={codeValue?.trim().length !== 6}
                />
              </form>
            )}
            {!deleteMethod && <Warning />}
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  )
}

interface DeleteMethodProps {
  title: string
  description: string
  onclick: () => void
  Icon: FC<SVGProps<SVGSVGElement>>
}

const DeleteMethod: FC<DeleteMethodProps> = ({
  title,
  description,
  onclick,
  Icon
}) => {
  return (
    <div
      className={
        'flex flex-col gap-2 border border-hover rounded-lg px-4 py-3 hover:bg-hover hover:cursor-pointer w-1/2'
      }
      onClick={onclick}
    >
      <Icon className={'icon w-5 h-5'} />
      <h4>{title}</h4>
      <p className={'secondaryText body-12'}>{description}</p>
    </div>
  )
}

const Warning = () => {
  const { t } = useTranslation([ENTITY])
  return (
    <div className={'w-full border border-systemRed rounded-lg flex gap-2 p-4'}>
      <div className={'p-[2px]'}>
        <Attention className={'iconRed w-6 h-6'} />
      </div>

      <div className={'flex flex-col gap-1'}>
        <h4>{t('safety.irreversibleAction', { ns: ENTITY })}</h4>
        <p className={'body-14-20 secondaryText'}>
          {t('safety.deleteAccountWarning', { ns: ENTITY })}
        </p>
      </div>
    </div>
  )
}

interface ButtonGroupProps {
  handleReset: () => void
  submitDisabled: boolean
}

const ButtonGroup: FC<ButtonGroupProps> = ({ handleReset, submitDisabled }) => {
  const { t } = useTranslation([TRANSLATION])
  return (
    <div className='flex gap-2 w-full'>
      <Button
        styleButton='outline'
        className='w-full'
        onClick={handleReset}
        type='button'
      >
        {t('cancel', { ns: TRANSLATION })}
      </Button>
      <Button
        styleButton='outline'
        colorButton='red'
        className='w-full'
        icon={<Trash className='w-4 h-4 iconRed' />}
        type='submit'
        disabled={submitDisabled}
      >
        {t('delete', { ns: TRANSLATION })}
      </Button>
    </div>
  )
}