import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { UserAvatar, UserChangeAvatarPopover } from '@/features/User'
import styles from '@/features/User/MemberPermissionSettings/MemberPermissionSettings.module.scss'
import { IUser } from '@/entities/User'
import { DATE_FORMAT } from '@/shared/const/date_format'
import { ENTITY, SUCCESS } from '@/shared/const/translation'
import { copyTextToClipboard } from '@/shared/lib/helpers/copyTextToClipboard'


interface Props {
  user: IUser
  isSmall?: boolean
  isForChange?: boolean
}

export const UserMainInfo: FC<Props> = ({
  user,
  isSmall = false,
  isForChange = false
}) => {
  const { t } = useTranslation([ENTITY, SUCCESS])
  const userName = `${user.firstName} ${user.lastName}`

  return (
    <div className={styles.info}>
      {isForChange ? (
        <UserChangeAvatarPopover user={user} isSmall={isSmall} />
      ) : (
        <UserAvatar
          user={user}
          className={classNames(styles.avatar, isSmall && styles.avatarSmall)}
        />
      )}

      <div
        className={classNames(
          styles.mainInfo,
          isSmall && 'py-0 px-3 justify-center'
        )}
      >
        {isSmall ? (
          <h3 className={'pl-1'}>{userName}</h3>
        ) : (
          <h2 className={'pl-1'}>{userName}</h2>
        )}

        <div className={'flex gap-1 body-14-16 w-full items-center'}>
          <CopyableField
            label={`${t('user.email', { ns: ENTITY })}:`}
            value={user.email}
            successMessage={t('emailCopied', { ns: SUCCESS })}
          />
          {user.username && <p>·</p>}
          {user.username && (
            <CopyableField
              label={`${t('user.username', { ns: ENTITY })}:`}
              value={user.username}
              successMessage={t('usernameCopied', { ns: SUCCESS })}
            />
          )}
        </div>

        {!isSmall && (
          <p className={'secondaryText body-14-16 pl-1'}>
            {t('user.registrationDate', { ns: ENTITY })}:{' '}
            {dayjs(user.dateCreated).format(DATE_FORMAT)}
          </p>
        )}
      </div>
    </div>
  )
}

const CopyableField = ({
  label,
  value,
  successMessage
}: {
  label: string
  value: string
  successMessage: string
}) => {
  return (
    <div
      className='flex gap-1 hover:cursor-pointer p-1 rounded hover:bg-hover'
      onClick={() => copyTextToClipboard(value, successMessage)}
    >
      <p className='secondaryText'>{label}</p>
      <p>{value}</p>
    </div>
  )
}
