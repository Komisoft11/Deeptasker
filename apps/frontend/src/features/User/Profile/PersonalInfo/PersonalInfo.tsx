import React, { FC } from 'react'
import { UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IUpdateUserProfileDTO } from '@/entities/User/model/types/user.interface'
import { ENTITY, PLACEHOLDERS } from '@/shared/const/translation'
import { Input } from '@/shared/ui/Input/Input'

interface Props {
  register: UseFormRegister<IUpdateUserProfileDTO>
}

export const PersonalInfo: FC<Props> = ({ register }) => {
  const { t } = useTranslation([ENTITY, PLACEHOLDERS])
  return (
    <div className={'flex border-b border-border gap-6 py-6'}>
      <div className={'flex flex-col gap-2 w-[480px]'}>
        <h4>{t('user.firstAndLastName', { ns: ENTITY })}</h4>
        <p className={'secondaryText body-14-16'}>
          {t('user.accountInfoNotice', { ns: ENTITY })}
        </p>
      </div>
      <div className={'w-[564px] flex flex-col gap-2'}>
        <Input
          autoComplete={'family-name'}
          label={t('user.lastName', { ns: ENTITY })}
          placeholder={t('lastName', { ns: PLACEHOLDERS }) as string}
          {...register('lastName')}
        />
        <div className={'flex gap-2'}>
          <Input
            autoComplete={'given-name'}
            label={t('user.firstName', { ns: ENTITY })}
            placeholder={t('firstName', { ns: PLACEHOLDERS }) as string}
            {...register('firstName')}
          />
          <Input
            label={t('user.middleName', { ns: ENTITY })}
            autoComplete={'additional-name'}
            placeholder={t('middleName', { ns: PLACEHOLDERS }) as string}
            {...register('middleName')}
          />
        </div>
      </div>
    </div>
  )
}
