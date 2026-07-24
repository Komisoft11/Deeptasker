import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, Outlet, useLocation } from 'react-router'
import styles from '@/pages/User/AuthPage/AuthPage.module.scss'
import { LangSwitcher } from '@/features/LangSwitcher/LangSwitcher'
import { PreviewBlock } from '@/entities/User/ui/PreviewBlock/PreviewBlock'
import logo from '@/shared/assets/images/logo.png'
import { INIT_URL, LEGAL_URL, LOGIN_URL } from '@/shared/config/route.config'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

const AuthPage = () => {
  const {
    authStore: { isAuth }
  } = useRootStore()
  const { pathname } = useLocation()
  const { t } = useTranslation([ENTITY])

  if (isAuth) {
    return <Navigate to={INIT_URL} />
  }

  const isLogin = pathname.includes(LOGIN_URL)

  return (
    <div className={styles.container}>
      <div className={styles.contentContainer}>
        <img src={logo} alt={'Deeptasker logo.'} className={styles.logo} />
        <div className={'flex flex-col gap-6 max-w-[434px]'}>
          <Outlet />
        </div>

        <div className={'flex flex-col gap-3'}>
          <LangSwitcher />
          {isLogin && (
            <Link
              to={LEGAL_URL}
              className={
                'secondaryText hover:opacity-70 hover:cursor-pointer body-12 text-center'
              }
            >
              {t('legal.title', { ns: ENTITY })}
            </Link>
          )}
        </div>
      </div>
      <PreviewBlock />
    </div>
  )
}

export default AuthPage
