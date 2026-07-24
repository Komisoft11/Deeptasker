import { useTranslation } from 'react-i18next'
import { MenuItem } from '@/features/Menu'
import { Appearance, Lock, Support } from '@/shared/assets/images/icons'
import { settings } from '@/shared/config/route.config'
import { ENTITY } from '@/shared/const/translation'
import { SettingsNavigator } from '@/shared/lib/navigators/settings.navigator'
import { Header } from '@/shared/ui/Header/Header'
import styles from './SettingsSidebar.module.scss'


export const SettingsSidebar = () => {
  const { t } = useTranslation([ENTITY])
  return (
    <div className={styles.sidebar}>
      <Header title={t('settings.label', { ns: ENTITY })} />
      <div className={'p-4 flex flex-col gap-2'}>
        <MenuItem
          to={SettingsNavigator.getSettingsUrl(settings.APPEARANCE)}
          title={t('settings.appearance', { ns: ENTITY })}
          isSidebarCollapsed={false}
          icon={<Appearance className={'icon w-5 h-5'} />}
        />
        <MenuItem
          to={SettingsNavigator.getSettingsUrl(settings.SAFETY)}
          title={t('settings.safety', { ns: ENTITY })}
          isSidebarCollapsed={false}
          icon={<Lock className={'icon w-5 h-5'} />}
        />
        <MenuItem
          to={SettingsNavigator.getSettingsUrl(settings.SUPPORT)}
          title={t('settings.support', { ns: ENTITY })}
          isSidebarCollapsed={false}
          icon={<Support className={'icon w-5 h-5'} />}
        />
      </div>
    </div>
  )
}
