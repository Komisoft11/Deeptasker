import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { ErrorPage } from '@/pages/Errors/ErrorPage/ErrorPage'
import { INIT_URL } from '@/shared/config/route.config'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { AuthenticationNavigator } from '@/shared/lib/navigators/authentication.navigator'


export const NotFoundPage = observer(() => {
  const { t } = useTranslation(TRANSLATION)

  const navigate = useNavigate()
  const handleNavigate = () => {
    navigate(INIT_URL)
  }

  const {
    authStore: { isAuth }
  } = useRootStore()

  return isAuth ? (
    <ErrorPage
      title={t('pageNotFound')}
      description={t('wrongPage')}
      buttonText={t('backToMain')}
      code={'404'}
      onClick={handleNavigate}
    />
  ) : (
    <Navigate to={AuthenticationNavigator.getAuthUrl()} replace />
  )
})
