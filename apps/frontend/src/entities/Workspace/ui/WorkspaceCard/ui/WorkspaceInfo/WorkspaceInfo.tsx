import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Workspace } from '@/entities/Workspace'
import { USER_ROLE_ADMIN } from '@/entities/Workspace/const/userRoles'
import { ENTITY } from '@/shared/const/translation'

interface Props {
  workspace: Workspace
}

interface IWorkspaceInfo {
  label: string
  value: string
}

export const WorkspaceInfo: FC<Props> = ({ workspace }) => {
  const { t } = useTranslation(ENTITY)

  const isWorkspaceAdmin = workspace.userRole === USER_ROLE_ADMIN

  const workspaceInfos: IWorkspaceInfo[] = [
    {
      label: t('workspace.role'),
      value: isWorkspaceAdmin
        ? t('workspace.roleCategories.admin')
        : t('workspace.roleCategories.member')
    },
    {
      label: t('workspace.owner'),
      value: `${workspace.user.firstName} ${workspace.user.lastName}`
    }
  ]

  return (
    <div className={'flex flex-col gap-4'}>
      {workspaceInfos.map(({ value, label }, i) => (
        <div key={i}>
          <p className={'body-12 secondaryText'}>{label}</p>
          <p className={'body-16'}>{value}</p>
        </div>
      ))}
      <p className={'body-12 secondaryText'}>
        {workspace.projectCount === 0 ? (
          t('workspace.noProjects')
        ) : (
          <span>
            {t('project.projectsCount', {
              count: workspace.projectCount
            })}
          </span>
        )}
      </p>
    </div>
  )
}
