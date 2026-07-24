import classNames from 'classnames'
import { FC, ReactNode } from 'react'
import { UserMainInfo } from '@/features/User/UserMainInfo/UserMainInfo'
import { IUser } from '@/entities/User'
import { Button } from '@/shared/ui/Button/Button'
import styles from './MemberPermissionSettings.module.scss'

interface Props {
  children: ReactNode
  onClick?: () => void
  isWorkspace?: boolean
  user: IUser
  removeUsers: boolean
}

export const MemberPermissionSettings: FC<Props> = ({
  user,
  children,
  onClick,
  isWorkspace = false,
  removeUsers
}) => {
  return (
    <div className={styles.container}>
      <div className={'flex flex-col gap-6 flex-1'}>
        <UserMainInfo user={user} />
        <div className={'flex flex-col gap-2 flex-1'}>
          <h3>Изменение прав</h3>
          {children}
        </div>
      </div>
      {removeUsers && (
        <div className={styles.buttonContainer}>
          <div className={'flex flex-col gap-2 max-w-[395px]'}>
            <h3>Удалить {isWorkspace ? 'админа' : 'пользователя'}</h3>
            <p className={'body-14-20 secondaryText'}>
              Это действие удалит {isWorkspace ? 'админа' : 'пользователя'} из{' '}
              {isWorkspace ? 'рабочего пространства' : 'проекта'}. Вы уверены,
              что хотите удалить {isWorkspace ? 'админа' : 'пользователя'}?
            </p>
          </div>

          <Button
            onClick={onClick}
            colorButton={'red'}
            styleButton={'outline'}
            className={classNames(styles.button, 'body-14-16')}
          >
            Удалить
          </Button>
        </div>
      )}
    </div>
  )
}
