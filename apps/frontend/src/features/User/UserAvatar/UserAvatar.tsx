import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { DetailedHTMLProps, FC, HTMLAttributes } from 'react'
import { FileService } from '@/entities/File/services/file.service'
import { IUser } from '@/entities/User'
import { IObserverUser } from '@/entities/User/model/types/user.interface'
import styles from './UserAvatar.module.scss'

interface IUserAvatarProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    'ref'
  > {
  user: IUser | IObserverUser
  className?: string
}

export const UserAvatar: FC<IUserAvatarProps> = observer(
  ({ user, className, ...props }) => {
    return user.avatarId ? (
      <img
        className={classNames(styles.avatar, className)}
        src={FileService.getAvatar(user.avatarId)}
        alt={'User Avatar'}
      />
    ) : (
      <div {...props} className={classNames(styles.avatar, className)}>
        <p className={'body-12'}>
          {(user.firstName[0] + user.lastName[0]).toUpperCase()}
        </p>
      </div>
    )
  }
)
