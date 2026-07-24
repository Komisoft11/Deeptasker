import { Navigate, RouteObject } from 'react-router'
import {
  SettingsAppearance,
  SettingsSafety,
  SettingsSupport
} from '@/widgets/Settings'
import {
  SETTINGS_APPEARANCE_URL,
  SETTINGS_INTEGRATIONS_SAFETY,
  SETTINGS_SUPPORT,
  settings
} from '@/shared/config/route.config'

export const SettingsRoutes: RouteObject[] = [
  {
    children: [
      {
        index: true,
        element: <Navigate to={settings.APPEARANCE} replace />
      },
      {
        path: SETTINGS_APPEARANCE_URL,
        element: <SettingsAppearance />
      },
      {
        path: SETTINGS_INTEGRATIONS_SAFETY,
        element: <SettingsSafety />
      },
      {
        path: SETTINGS_SUPPORT,
        element: <SettingsSupport />
      }
    ]
  }
]
