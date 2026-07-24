import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermissionWorkspace } from '@/entities/Workspace/model/PermissionWorkspace'
import { Plus } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ButtonWithIcon } from '@/shared/ui/Button/ButtonWithIcon/ButtonWithIcon'
import styles from './EmptyProject.module.scss'


export const EmptyProject: FC = () => {
  const {
    workspaceStore: { activeWorkspace }
  } = useRootStore()

  const { t } = useTranslation()

  const { canCreateProjects } = usePermissionWorkspace(activeWorkspace)

  return (
    <div className={styles.container}>
      <p className={'main-text mb-3'}>{t('project.error.empty')}</p>
      {canCreateProjects && (
        <ButtonWithIcon styleButton={'outline'} icon={<Plus />}>
          {t('project.new')}
        </ButtonWithIcon>
      )}
    </div>
  )
}
