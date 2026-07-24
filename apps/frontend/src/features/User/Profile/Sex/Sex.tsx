import classNames from 'classnames'
import React, { FC } from 'react'
import { Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { RadioGroup } from '@/shared/ui/RadioGroup/RadioGroup'
import styles from './Sex.module.scss'

interface Props {
  control: Control<any>
}

export const Sex: FC<Props> = ({ control }) => {
  const { t } = useTranslation([ENTITY, TRANSLATION])
  return (
    <div className={'flex border-b border-border gap-6 py-6'}>
      <div className={'flex flex-col gap-2 w-[480px]'}>
        <h4>{t('user.gender.title', { ns: ENTITY })}</h4>
        <p className={'secondaryText body-14-16'}>
          {t('optionalField', { ns: TRANSLATION })}
        </p>
      </div>
      <Controller
        name={'sex'}
        control={control}
        render={({ field: { value, onChange } }) => (
          <RadioGroup
            className={styles.list}
            value={value}
            onValueChange={onChange}
          >
            <RadioGroup.Options
              itemClassName={classNames(styles.label, 'body-14-16')}
              labelClassName={'w-full'}
              options={[
                {
                  label: t('user.gender.unspecified', { ns: ENTITY }),
                  value: ''
                },
                {
                  label: t('user.gender.female', { ns: ENTITY }),
                  value: 'F'
                },
                {
                  label: t('user.gender.male', { ns: ENTITY }),
                  value: 'M'
                }
              ]}
            />
          </RadioGroup>
        )}
      />
    </div>
  )
}
