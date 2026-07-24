import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Notifications } from '@/widgets/Notifications/Notifications'
import { useNotifications } from '@/entities/Notifications/lib/hooks/useNotifications'
import { Trash } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Header } from '@/shared/ui/Header/Header'
import styles from './NotificationsPage.module.scss'


export const NotificationsPage = observer(() => {
  const {
    dialogStore: { deleteDialog }
  } = useRootStore()
  const {
    count,
    readAllAsync,
    notifications,
    fetchNotifications,
    deleteAllAsync
  } = useNotifications()
  const { t } = useTranslation([ENTITY, TRANSLATION])

  if (!notifications) {
    fetchNotifications()
    return <p className={'body-14-16'}>Loading</p>
  }

  const handleReadAll = async () => {
    await readAllAsync.mutateAsync()
  }

  const handleDeleteAll = async () => {
    if (!notifications) return

    if (notifications.length !== 0) {
      deleteDialog.title = `${t('notifications', { ns: TRANSLATION })} / ${t(
        'delete',
        {
          ns: TRANSLATION
        }
      )}`
      deleteDialog.body = (
        <div className='flex flex-col gap-6 pt-6'>
          <div className='flex flex-col gap-2'>
            <h3>{t('notifications.all', { ns: ENTITY })}</h3>
            <p className='secondaryText body-14-20'>
              {t('workspace.confirmDelete', { ns: ENTITY })}{' '}
              {t('notifications.all', { ns: ENTITY }).toLowerCase()}?
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='body-12 secondaryText'>
              {t('workspace.youLose', { ns: ENTITY })}
            </p>
            <p className='body-16'>
              {t('notifications.notificationsCount', {
                ns: ENTITY,
                count: notifications.length
              })}
            </p>
          </div>
        </div>
      )
      deleteDialog.buttonText = t('delete', { ns: TRANSLATION })
      deleteDialog.deleteFunction = async () => {
        await deleteAllAsync.mutateAsync()
      }
    } else {
      await deleteAllAsync.mutateAsync()
    }
  }

  return (
    <div className={'flex flex-col'}>
      <Header
        title={`${t('notifications', { ns: TRANSLATION })} (${
          notifications && notifications.length
        })`}
        className={'h-[73px]'}
      >
        {count > 0 && (
          <Button
            styleButton={'filled'}
            className={'body-14-16 p-3 max-w-max w-full'}
            onClick={handleReadAll}
          >
            {t('notifications.readAll', { ns: ENTITY })}
          </Button>
        )}
        {notifications.length > 0 && (
          <Button
            styleButton={'outline'}
            colorButton={'red'}
            className={'body-14-16 p-3 max-w-max w-full'}
            onClick={handleDeleteAll}
          >
            <Trash className={'w-4 h-4 iconRed'} />
            {t('delete', { ns: TRANSLATION })}
          </Button>
        )}
      </Header>
      <div className={classNames(styles.content, 'scrollbarContainerOnBg')}>
        <Notifications />
      </div>
    </div>
  )
})
