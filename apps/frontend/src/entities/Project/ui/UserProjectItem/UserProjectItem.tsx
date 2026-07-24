import classNames from 'classnames'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from '@/features/User/UserAvatar/UserAvatar'
import { IUser } from '@/entities/User'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './UserTeamItem.module.scss'


interface Props {
  user: IUser
}

export const UserProjectItem: FC<Props> = ({ user }) => {
  const { t } = useTranslation()
  const {
    projectStore: { activeProject }
  } = useRootStore()

  const currentUser = LocalStorageHelper.getUser()
  const isYou = user.id === currentUser.id
  const isOwner = activeProject.user.id === user.id
  const isCurrentUserOwner = activeProject.user.id === currentUser.id
  // const isLast = activeProject.members.at(-1)?.id === user.id

  return (
    <div className={styles.container}>
      <div className={''} />
      <div className={styles.info}>
        <UserAvatar user={user} className={styles.avatar} />
        <div className={styles.body}>
          <span className={styles.username}>
            {user.firstName} {user.lastName}
          </span>
          <div className={'flex'}>
            {isOwner || isYou ? (
              <span className={styles.status}>
                {isOwner ? t('team.owner') : t('team.you')}
              </span>
            ) : null}
            {isOwner && isYou && (
              <span className={classNames(styles.status, 'ml-1')}>
                ({t('team.you')})
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        className={classNames(
          styles.email,
          !isYou && !isCurrentUserOwner && 'mr-[1.75rem]'
        )}
      >
        {user.email}
      </div>
      <div className={styles.menu}>
        {/*{(isCurrentUserOwner || isYou) && (*/}
        {/*  // <WorkspaceUserMenuDrpodownl*/}
        {/*  //   user={user}*/}
        {/*  //   isCurrentUserOwner={isCurrentUserOwner}*/}
        {/*  // />*/}
        {/*// )}*/}
      </div>
      {/*{isLast && <div className={'border-bottom-gray'} />}*/}
    </div>
  )
}
