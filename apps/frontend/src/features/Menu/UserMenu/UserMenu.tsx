import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { MenuItem } from '@/features/Menu'
import { NotificationPopover } from '@/features/Notification/NotificationPopover/NotificationPopover'
import { UserAvatar } from '@/features/User'
import { Gear } from '@/shared/assets/images/icons'
import { nsObject } from '@/shared/lib/helpers/translation.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProfileNavigator } from '@/shared/lib/navigators/profile.navigator'
import { SettingsNavigator } from '@/shared/lib/navigators/settings.navigator'

interface Props {
  isSidebarCollapsed: boolean
}

export const UserMenu: FC<Props> = observer(({ isSidebarCollapsed }) => {
  const { t } = useTranslation()
  const {
    authStore: { user }
  } = useRootStore()
  const { sidebarStore } = useRootStore()

  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'flex flex-col gap-1'}>
        <NotificationPopover isSidebarCollapsed={isSidebarCollapsed} />

        <MenuItem
          to={SettingsNavigator.getSettingsUrl()}
          title={t('setting', nsObject())}
          onClick={() => sidebarStore.toggleSecondLeft('settings')}
          icon={<Gear className={'icon'} />}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </div>
      <MenuItem
        to={ProfileNavigator.getProfileUrl()}
        onClick={() => sidebarStore.closeLeftSecondSidebar()}
        title={t('profile.title')}
        isSidebarCollapsed={isSidebarCollapsed}
      >
        <UserAvatar user={user} />
      </MenuItem>
    </div>
  )
})
