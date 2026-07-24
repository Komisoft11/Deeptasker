import React from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { ErrorPage } from '@/pages/Errors/ErrorPage/ErrorPage'
import { INIT_URL } from '@/shared/config/route.config'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { AuthenticationNavigator } from '@/shared/lib/navigators/authentication.navigator'

export const ServerError = () => {
  const { t } = useTranslation(TRANSLATION)
  const navigate = useNavigate()
  const handleReloadPage = () => {
    navigate(INIT_URL)
  }

  const {
    authStore: { isAuth }
  } = useRootStore()

  return isAuth ? (
    <ErrorPage
      title={t('serverError')}
      description={t('tryReload')}
      buttonText={'Обратно к задачам'}
      code={'500'}
      onClick={handleReloadPage}
    />
  ) : (
    <Navigate to={AuthenticationNavigator.getAuthUrl()} replace />
  )
}
