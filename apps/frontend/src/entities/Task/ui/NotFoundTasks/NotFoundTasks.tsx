import { useTranslation } from 'react-i18next'
import { nsObject } from '@/shared/lib/helpers/translation.helper'
import styles from './NotFoundTasks.module.scss'

export const NotFoundTasks = () => {
  const { t } = useTranslation()

  return (
    <div className={styles.container}>{t('sorryNothingFound', nsObject())}</div>
  )
}
