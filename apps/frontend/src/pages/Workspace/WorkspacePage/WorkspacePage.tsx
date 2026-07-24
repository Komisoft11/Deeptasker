import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'
import { optionWorkspaceTabs } from '@/shared/config/route.config'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { nsObject } from '@/shared/lib/helpers/translation.helper'
import { useCurrentWorkspaceSettings } from '@/shared/lib/hooks/useCurrentWorkspaceSettings'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { WorkspacesNavigator } from '@/shared/lib/navigators/worksapce.navigator'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs/Breadcrumbs'
import { IBreadcrumb } from '@/shared/ui/Breadcrumbs/type/breadcrumbs.interface'
import { Header } from '@/shared/ui/Header/Header'
import styles from './WorkspacePage.module.scss'


interface Props {
  workspaceId: number
}

export const WorkspacePage = observer(({ workspaceId }: Props) => {
  const { workspaceStore } = useRootStore()
  const workspace = workspaceStore.get(workspaceId)

  const { t } = useTranslation([ENTITY, TRANSLATION])
  const ns = nsObject()

  const { tab } = useCurrentWorkspaceSettings()

  const breadcrumbs: IBreadcrumb[] = [
    {
      id: 'ws main',
      title: t('workspace.title', { ns: ENTITY }),
      url: WorkspacesNavigator.getWorkspaceGridUrl(
        workspaceStore.activeWorkspace.id
      )
    },
    {
      id: `ws tab ${tab}`,
      title: t(tab, ns),
      url: WorkspacesNavigator.getWorkspaceUrlWithId({
        currentWorkspaceId: workspaceStore.activeWorkspace.id,
        workspaceId: workspace.id,
        tab: tab
      })
    }
  ]

  return (
    <div className='flex flex-col h-full'>
      <Header title={<Breadcrumbs breadcrumbs={breadcrumbs} />} />
      <div className={styles.content}>
        <h3 className={'px-4 pt-4'}>{workspace.title}</h3>
        <div className={'px-4'}>
          <Link
            className={classNames(
              styles.tab,
              'body-14-16',
              tab === optionWorkspaceTabs.SETTINGS && styles.active
            )}
            to={WorkspacesNavigator.getWorkspaceUrlWithId({
              currentWorkspaceId: workspaceStore.activeWorkspace.id,
              workspaceId: workspace.id,
              tab: optionWorkspaceTabs.SETTINGS
            })}
          >
            {t('setting', { ns: TRANSLATION })}
          </Link>
          <Link
            className={classNames(
              styles.tab,
              'body-14-16',
              tab === optionWorkspaceTabs.ADMINS && styles.active
            )}
            to={WorkspacesNavigator.getWorkspaceUrlWithId({
              currentWorkspaceId: workspaceStore.activeWorkspace.id,
              workspaceId: workspace.id,
              tab: optionWorkspaceTabs.ADMINS
            })}
          >
            {t('admins', { ns: TRANSLATION })}
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  )
})
