import classNames from 'classnames'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { observer } from 'mobx-react-lite'
import React, { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/AddTime/AddTime'
import { sortTimes } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/helpers/sortTimes'
import { useTimeHistory } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/hooks/useTimeHistory'
import { EditTimeForm } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/ui/EditTimeForm/EditTimeForm'
import { usePermissionTask } from '@/entities/Task'
import { Close, PlusCircle } from '@/shared/assets/images/icons'
import { ENTITY, PLACEHOLDERS, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { FooterButton } from '@/shared/ui/FooterButton/FooterButton'
import { Table } from '@/shared/ui/Table/Table'
import styles from './TimeTab.module.scss'


dayjs.extend(utc)

export interface FormValues {
  comment: string
  endDate: string
}

export const TimeTab = observer(() => {
  const {
    taskStore: { activeTask },
    authStore: { user }
  } = useRootStore()
  const { timeHistory } = useTimeHistory(activeTask)
  const { editTaskTracking } = usePermissionTask(activeTask)
  const { t } = useTranslation([ENTITY, TRANSLATION, PLACEHOLDERS])

  const sortedTime = sortTimes(timeHistory)

  const [isAddTime, setIsAddTime] = useState<boolean>(false)

  const handleAddTimeClick = useCallback(() => {
    setIsAddTime((prev) => !prev)
  }, [])

  const headerTitles = ['Имя', 'Начало', 'Окончание', 'Время', '']

  const hasTimeHistory = timeHistory.length > 0

  const isExecutor = activeTask.executor?.id === user.id

  const isShowButton = isExecutor && editTaskTracking

  return (
    <div className={styles.container}>
      {hasTimeHistory ? (
        <Table className={'body-14-16'}>
          <Table.Head>
            <Table.Row className={classNames(styles.tableRow)}>
              {headerTitles.map((headerTitle, index) => (
                <div key={index} className={'DT_TableCell'}>
                  {headerTitle}
                </div>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body className={'flex flex-col'}>
            {isAddTime && hasTimeHistory && (
              <AddTime setIsAddTime={setIsAddTime} />
            )}
            {sortedTime.map((time) => (
              <EditTimeForm time={time} key={time.id} />
            ))}
          </Table.Body>
        </Table>
      ) : !isAddTime ? (
        <p className={'body-12 w-full secondaryText text-center'}>
          {t('timeTrackingHistory', { ns: PLACEHOLDERS })}
        </p>
      ) : (
        <AddTime setIsAddTime={setIsAddTime} />
      )}

      {isShowButton && (
        <FooterButton
          buttonText={
            !isAddTime
              ? t('time.add', { ns: ENTITY })
              : t('cancel', { ns: TRANSLATION })
          }
          styleButton={'filled'}
          colorButton={'dark'}
          isAbsolute
          Icon={!isAddTime ? PlusCircle : Close}
          onClick={handleAddTimeClick}
        />
      )}
    </div>
  )
})
