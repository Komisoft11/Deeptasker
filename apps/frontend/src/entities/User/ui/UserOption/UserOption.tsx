import classNames from 'classnames'
import { FC } from 'react'
import { UserAvatar } from '@/features/User/UserAvatar/UserAvatar'
import { IUser } from '@/entities/User'
import { IObserverUser } from '@/entities/User/model/types/user.interface'

interface Props {
  user: IUser | IObserverUser
  className?: string
}

export const UserOption: FC<Props> = ({ user, className }) => {
  return (
    <div
      className={classNames('flex gap-2 items-start hover:bg-red', className)}
    >
      <UserAvatar
        user={user}
        style={{
          width: '24px',
          height: '24px',
          fontSize: '6px',
          borderRadius: '24px'
        }}
      />

      <div className={'flex flex-col gap-1'}>
        <p className={'body-12 text-textMain'}>
          {user.firstName} {user.lastName}
        </p>
        <p className={'body-12 secondaryText'}>@{user.username}</p>
      </div>
    </div>
  )
}
