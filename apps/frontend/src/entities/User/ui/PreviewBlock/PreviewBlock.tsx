import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import MAIN_IMG from '@/shared/assets/images/main.png'
import { LOGIN_URL } from '@/shared/config/route.config'
import { nsObject } from '@/shared/lib/helpers/translation.helper'
import styles from './PreviewBlock.module.scss'


export const PreviewBlock = () => {
  const { t } = useTranslation()

  const { pathname } = useLocation()

  const isLogin = (): boolean => {
    const arr = pathname.split('/')

    return arr[arr.length - 1] === LOGIN_URL
  }

  return (
    <div className={styles.preview}>
      <div className={'flex flex-col gap-4 max-w-[800px] pr-8'}>
        <h1>{t('loginImageTitle', nsObject())}</h1>
        <p className={'secondaryText body-20'}>
          {isLogin()
            ? t('loginImageText', nsObject())
            : t('registrationImageText', nsObject())}
        </p>
      </div>
      <div
        className={styles.imgContainer}
        style={{ backgroundImage: `url(${MAIN_IMG})` }}
      />
    </div>
  )
}
