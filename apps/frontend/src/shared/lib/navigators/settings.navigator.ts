import { SETTINGS_URL, settings } from '@/shared/config/route.config'
import { SettingsOptions } from '@/shared/types/navigator.intreface'

export const SettingsNavigator = {
  getSettingsUrl(tab: SettingsOptions = settings.APPEARANCE): string {
    return `${SETTINGS_URL}/${tab}`
  }
} as const
