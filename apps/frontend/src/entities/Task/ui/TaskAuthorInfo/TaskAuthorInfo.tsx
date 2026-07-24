import classNames from 'classnames'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { Task } from '@/entities/Task'
import { UserService } from '@/entities/User/services/user.service'
import { Copy } from '@/shared/assets/images/icons'
import { DATE_TIME_FORMAT } from '@/shared/const/date_format'
import { ENTITY, ERRORS } from '@/shared/const/translation'
import { copyTextToClipboard } from '@/shared/lib/helpers/copyTextToClipboard'
import styles from './TaskAuthorInfo.module.scss'


interface Props {
  task: Task
}

export const TaskAuthorInfo = observer(({ task }: Props) => {
  const dateCreated = dayjs(task.dateCreated).format(DATE_TIME_FORMAT)
  const { t } = useTranslation([ENTITY, ERRORS])

  const handleClick = async () => {
    await copyTextToClipboard(task.externalId)
  }

  return (
    <div className={classNames(styles.info, 'secondaryText body-14-16')}>
      <p>
        {t('task.author', { ns: ENTITY })}: {UserService.getFullName(task.user)}{' '}
        ·
      </p>
      <p>
        {t('task.created', { ns: ENTITY })}: {dateCreated} ·
      </p>
      <div className={styles.container} onClick={handleClick}>
        <p>ID: {task.externalId}</p>
        <Copy className={classNames('iconSecondary w-4 h-4', styles.icon)} />
      </div>
    </div>
  )
})
