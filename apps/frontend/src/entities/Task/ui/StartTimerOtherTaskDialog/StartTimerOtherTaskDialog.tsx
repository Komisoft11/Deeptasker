import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Task, useTimerTask } from '@/entities/Task'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Dialog } from '@/shared/ui/Dialog/Dialog'

interface Props {
  changeVisible: (visible: boolean) => void
  task: Task
  visibility: boolean
}

export const StartTimerOtherTaskDialog: FC<Props> = ({
  task,
  changeVisible,
  visibility
}) => {
  const { taskTimerStore } = useRootStore()
  const { startTimerAsync, stopTimerAsync } = useTimerTask()
  const { t } = useTranslation(TRANSLATION)

  const isCurrentTaskRunning = taskTimerStore.isCurrentTaskRunning(task)

  const handleApply = async () => {
    if (isCurrentTaskRunning) {
      return stopTimerAsync.mutateAsync(task)
    }

    return startTimerAsync.mutateAsync(task)
  }

  const handleCancel = () => {
    changeVisible(false)
  }

  return (
    <Dialog onOpenChange={changeVisible} open={visibility}>
      <Dialog.Content>
        <Dialog.Title>Таймер уже запущен</Dialog.Title>
        <p> Вы уверены, что хотите остановить трекинг задачи? </p>
        <div className={'flex gap-3'}>
          <Button styleButton={'filled'} onClick={handleApply}>
            {t('accept')}
          </Button>
          <Button styleButton={'outline'} onClick={handleCancel}>
            {t('cancel')}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  )
}
