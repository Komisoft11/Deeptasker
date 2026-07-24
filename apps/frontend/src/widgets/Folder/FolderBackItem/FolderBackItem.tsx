import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { ArrowLeft } from '@/shared/assets/images/icons'
import { RouterParams } from '@/shared/config/route.config'
import { TRANSLATION } from '@/shared/const/translation'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Button } from '@/shared/ui/Button/Button'
import styles from './FolderBackItem.module.scss'


export const FolderBackItem = () => {
  const {
    workspaceStore: { activeWorkspace },
    folderStore,
    projectStore
  } = useRootStore()
  const { t } = useTranslation([TRANSLATION])
  const { folderId, slugId } = useParams<RouterParams>()
  const { view } = useCurrentView()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const handleNavigateBack = () => {
    const folder = folderStore.get(Number(folderId))
    if (folder.parent) {
      navigate(
        ProjectsNavigator.getExistProjectUrl({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: projectStore.activeProject.slug,
          folderId: folder.parent.id,
          params
        })
      )
    } else {
      navigate(
        ProjectsNavigator.getExistProjectUrl({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: slugId as string,
          view,
          params
        })
      )
      folderStore.clearActiveFolder()
    }
  }

  return (
    <div className={'flex gap-4 items-center'}>
      <Button
        styleButton={'outline'}
        colorButton='dark'
        className={styles.button}
        onClick={handleNavigateBack}
      >
        <ArrowLeft className={'icon w-5 h-5'} />
        <p className='body-14-16'>{t('back', { ns: TRANSLATION })}</p>
      </Button>
      <div className={'w-[1px] bg-border h-[calc(100%-4px)]'} />
    </div>
  )
}
