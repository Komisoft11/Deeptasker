import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { Task, useTimerTask } from '@/entities/Task'
import { Pause, Start } from '@/shared/assets/images/icons'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'

interface Props {
  task: Task
  className?: string
}

export const ButtonTimer = observer(({ task, className }: Props) => {
  const { taskTimerStore } = useRootStore()
  const { startTimerAsync, stopTimerAsync } = useTimerTask()
  const { t } = useTranslation(TRANSLATION)

  const isCurrentTaskRunning = taskTimerStore.isCurrentTaskRunning(task)
  const timerString = taskTimerStore.getTimerStingByTask(task)

  const handleTimerClick = async () => {
    if (isCurrentTaskRunning) {
      return stopTimerAsync.mutateAsync(task)
    }

    return startTimerAsync.mutateAsync(task)
  }

  const timerIcon = isCurrentTaskRunning ? (
    <Pause className='icon w-4 h-4' />
  ) : (
    <Start className='icon w-4 h-4' />
  )

  return (
    <Button
      styleButton={'outline'}
      icon={timerIcon}
      onClick={handleTimerClick}
      className={className}
    >
      {isCurrentTaskRunning || timerString > '00:00:00'
        ? timerString
        : t('startExecution')}
    </Button>
  )
})
