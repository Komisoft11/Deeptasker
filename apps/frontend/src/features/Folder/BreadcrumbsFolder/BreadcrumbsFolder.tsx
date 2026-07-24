import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Folder } from '@/entities/Folder'
import { FolderIcon } from '@/shared/assets/images/icons'
import { RouterParams } from '@/shared/config/route.config'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs/Breadcrumbs'
import { IBreadcrumb } from '@/shared/ui/Breadcrumbs/type/breadcrumbs.interface'

interface Props {
  folder?: Folder
  isSmall?: boolean
  hasLastBreadcrumbLink?: boolean
  isKanban?: boolean
}

export const BreadcrumbsFolder = observer(
  ({
    folder,
    hasLastBreadcrumbLink = false,
    isSmall = false,
    isKanban = false
  }: Props) => {
    const {
      workspaceStore: { activeWorkspace },
      folderStore,
      projectStore
    } = useRootStore()
    const { folderId } = useParams<RouterParams>()
    const { view } = useCurrentView()
    const { activeProject } = projectStore
    const navigate = useNavigate()
    const [params] = useSearchParams()

    const breadcrumbs = useMemo(() => {
      const targetFolder =
        folder ?? (folderId && folderStore.get(Number(folderId)))

      const folderBreadcrumbs = targetFolder
        ? getBreadcrumbs(
            activeWorkspace.id,
            targetFolder,
            isSmall,
            isKanban,
            params
          )
        : []

      if (folderBreadcrumbs.length > 0 && !hasLastBreadcrumbLink) {
        folderBreadcrumbs[folderBreadcrumbs.length - 1] = {
          ...folderBreadcrumbs[folderBreadcrumbs.length - 1],
          url: undefined
        }
      }

      return [
        {
          id: `root:${activeProject.id}`,
          title: activeProject.title,
          onClick: () => {
            navigate(
              ProjectsNavigator.getExistProjectUrl({
                currentWorkspaceId: activeWorkspace.id,
                projectSlug: activeProject.slug,
                view,
                params
              })
            )
            folderStore.clearActiveFolder()
          }
        },
        ...folderBreadcrumbs
      ]
    }, [
      folderId,
      folder,
      isSmall,
      isKanban,
      hasLastBreadcrumbLink,
      activeProject,
      view
    ])

    return <Breadcrumbs breadcrumbs={breadcrumbs} maxCount={3} />
  }
)

function getBreadcrumbs(
  currentWorkspaceId: number,
  folder: Folder,
  isSmall: boolean,
  isKanban: boolean,
  params: URLSearchParams
): IBreadcrumb[] {
  const breadcrumbs: IBreadcrumb[] = folder.parent
    ? [
        ...getBreadcrumbs(
          currentWorkspaceId,
          folder.parent,
          isSmall,
          isKanban,
          params
        )
      ]
    : []

  breadcrumbs.push({
    id: folder.id,
    title: folder.title,
    icon: <FolderIcon className={'icon w-4 h-4'} />,
    url: ProjectsNavigator.getExistProjectUrl({
      currentWorkspaceId,
      projectSlug: folder.project.slug,
      folderId: folder.id,
      params
    })
  })

  return breadcrumbs
}
