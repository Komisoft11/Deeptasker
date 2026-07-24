import { observer } from 'mobx-react-lite'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { ProjectMembers, UserProfileProject } from '@/features/Project'
import { IUser } from '@/entities/User'
import { RouterParams } from '@/shared/config/route.config'
import { TRANSLATION } from '@/shared/const/translation'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs/Breadcrumbs'
import { IBreadcrumb } from '@/shared/ui/Breadcrumbs/type/breadcrumbs.interface'
import { Dialog } from '@/shared/ui/Dialog/Dialog'

export const ProjectMembersTab: FC = observer(() => {
  const { projectId } = useParams<RouterParams>()

  const {
    projectStore,
    workspaceStore: { activeWorkspace }
  } = useRootStore()
  const { t } = useTranslation([TRANSLATION])

  const project = projectStore.get(Number(projectId))

  const [selectedUser, setSelectedUser] = useState<IUser | undefined>(undefined)

  const { view } = useCurrentView()

  const breadcrumbs: IBreadcrumb[] = [
    {
      id: 'project title',
      title: project.title,
      url: ProjectsNavigator.getExistProjectUrl({
        currentWorkspaceId: activeWorkspace.id,
        projectSlug: project.slug,
        view
      })
    },
    {
      id: `project settings`,
      title: t('setting', { ns: TRANSLATION }),
      url: ProjectsNavigator.getProjectUrlWithId({
        currentWorkspaceId: activeWorkspace.id,
        projectId: project.id,
        tab: 'general'
      })
    },
    {
      id: `ws people`,
      title: t('people', { ns: TRANSLATION }),
      url: ProjectsNavigator.getProjectUrlWithId({
        currentWorkspaceId: activeWorkspace.id,
        projectId: project.id,
        tab: 'people'
      })
    }
  ]

  return (
    <>
      <ProjectMembers setSelectedUser={setSelectedUser} project={project} />
      <Dialog
        open={!!selectedUser}
        onOpenChange={(value) => !value && setSelectedUser(undefined)}
      >
        <Dialog.Content title={<Breadcrumbs breadcrumbs={breadcrumbs} />}>
          {selectedUser && (
            <UserProfileProject
              setSelectedUser={setSelectedUser}
              user={selectedUser}
              project={project}
            />
          )}
        </Dialog.Content>
      </Dialog>
    </>
  )
})
