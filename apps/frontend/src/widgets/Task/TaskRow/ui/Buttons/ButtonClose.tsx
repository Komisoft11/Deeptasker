import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useExecuteTask } from '@/widgets/Task/ExecuteTask/lib/useExecuteTask'
import { Task } from '@/entities/Task'
import { TRANSLATION } from '@/shared/const/translation'
import { Button } from '@/shared/ui/Button/Button'
import styles from './ButtonClose.module.scss'


interface Props {
  className?: string
  task: Task
}

const ButtonClose = observer(({ task, className }: Props) => {
  const { handleFinishTask, isExecuted } = useExecuteTask(task)
  const { t } = useTranslation(TRANSLATION)

  return (
    <Button
      styleButton={'filled'}
      colorButton={isExecuted ? 'green' : 'accent'}
      className={classNames(
        styles.button,
        className,
        isExecuted ? styles.done : null
      )}
      onClick={async (e) => {
        await handleFinishTask(e)
      }}
    >
      {isExecuted ? t('completed') : t('complete')}
    </Button>
  )
})

export default ButtonClose
