import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { isEmpty } from '@/shared/lib/helpers/main.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { UserProjectItem } from '../UserProjectItem/UserProjectItem'
import styles from './UserWorkspaceList.module.scss'


export const UserProjectList: FC = observer(() => {
  const {
    projectStore: { activeProject }
  } = useRootStore()

  return (
    <div className={styles.container}>
      {!isEmpty(activeProject.user) && (
        <UserProjectItem user={activeProject.user} />
      )}

      {/*{activeProject.members.length !== 0 &&*/}
      {/*  activeProject.members.map((user) => (*/}
      {/*    <UserProjectItem user={user} key={user.id} />*/}
      {/*  ))}*/}
    </div>
  )
})
