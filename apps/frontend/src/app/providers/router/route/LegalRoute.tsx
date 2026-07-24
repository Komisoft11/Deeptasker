import { Navigate, RouteObject } from 'react-router'
import { LegalPage } from '@/pages/LegalPage/LegalPage'
import { LEGAL_TABS_CONFIG } from '@/widgets/Legal/const/tabsConfig'
import { LEGAL_URL, legalTab } from '@/shared/config/route.config'

export const LegalRoute: RouteObject = {
  path: LEGAL_URL,
  Component: LegalPage,
  children: [
    {
      index: true,
      element: <Navigate to={legalTab.CONSENT} replace />
    },

    ...LEGAL_TABS_CONFIG.map((tab) => ({
      path: tab.slug,
      element: <tab.component />
    }))
  ]
}
