import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './ProjectHeader.module.scss'

export const ProjectHeader: FC = observer(() => {
  const { t } = useTranslation()
  const { projectStore } = useRootStore()

  return (
    <div className={styles.container}>
      <h1> {projectStore.activeProject.title}</h1>
      {/*<ButtonWithIcon*/}
      {/*  styleButton={'outline'}*/}
      {/*  icon={<AddIcon />}*/}
      {/*  onClick={() => onOpenChange(true)}*/}
      {/*>*/}
      {t('team.invite')}
      {/*</ButtonWithIcon>*/}
      {/*// <InviteMemberInProjectDialog*/}
      {/*//   isVisible={open}*/}
      {/*//   changeDialog={onOpenChange}*/}
      {/*// />*/}
    </div>
  )
})
