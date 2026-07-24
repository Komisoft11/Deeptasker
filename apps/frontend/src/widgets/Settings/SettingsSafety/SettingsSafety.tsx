import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChangeEmail,
  ChangePassword,
  ChangeUsername,
  DeleteAccountModal,
  LegalDocsLink
} from '@/entities/Safety'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import useDialogAndPopover from '@/shared/lib/hooks/useDialogAndPopover'
import { Button } from '@/shared/ui/Button/Button'
import { Header } from '@/shared/ui/Header/Header'


export const SettingsSafety = () => {
  const { t } = useTranslation([ENTITY, TRANSLATION])
  const { open, onOpenChange } = useDialogAndPopover()
  return (
    <>
      <Header title={t('safety.title', { ns: ENTITY })} />
      <div className={'flex flex-col h-[calc(100%-73px)] justify-between '}>
        <div className={'p-4 pt-0'}>
          <ChangeUsername />
          <ChangePassword />
          <ChangeEmail />
          <LegalDocsLink />
        </div>
        <div
          className={
            'flex justify-between w-full p-4 border-t border-border self-end items-center'
          }
        >
          <div className={'flex flex-col gap-2 max-w-[585px]'}>
            <h4>{t('safety.deleteAccount', { ns: ENTITY })}</h4>
            <p className={'secondaryText body-12'}>
              {t('safety.deleteAccountDescription', { ns: ENTITY })}
            </p>
          </div>
          <Button
            colorButton={'red'}
            styleButton={'outline'}
            className={'w-[97px] max-h-12 body-16'}
            onClick={() => onOpenChange(true)}
          >
            {t('delete', { ns: TRANSLATION })}
          </Button>
        </div>

        <DeleteAccountModal open={open} onOpenChange={onOpenChange} />
      </div>
    </>
  )
}
