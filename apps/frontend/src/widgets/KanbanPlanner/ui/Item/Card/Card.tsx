import type { UniqueIdentifier } from '@dnd-kit/core'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { SubtasksAccordion } from '@/widgets/KanbanPlanner/ui/Item/SubtasksAccordion/SubtasksAccordion'
import { TaskContent } from '@/widgets/KanbanPlanner/ui/Item/TaskContent/TaskContent'
import { TaskFooter } from '@/widgets/KanbanPlanner/ui/Item/TaskFooter/TaskFooter'
import { TaskHeader } from '@/widgets/KanbanPlanner/ui/Item/TaskHeader/TaskHeader'
import { TaskProjectTag } from '@/widgets/Task'
import { Task, usePermissionTask } from '@/entities/Task'
import { CardSize } from '@/entities/TaskPlanner'
import { StatusCodes } from '@/shared/const/statusCodes'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './Card.module.scss'


interface Props {
  task: Task
  removeItem?: (id: UniqueIdentifier) => void
}

export const Card = observer(({ task, removeItem }: Props) => {
  const {
    taskPlanerStore: { cardSize }
  } = useRootStore()

  const { canOpenTask, canEditTags } = usePermissionTask(task)

  const [isAddSubtask, setAddSubtask] = useState(false)
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    undefined
  )

  const isCardSmall = cardSize === CardSize.small
  const isCardMediumOrLarge =
    cardSize === CardSize.medium || cardSize === CardSize.large

  const isShowAccordion =
    isCardMediumOrLarge && (task.subtasks.length > 0 || isAddSubtask)

  const isFinished = task.status.code === StatusCodes.EXECUTED

  return (
    <div className={styles.cardContainer}>
      <div
        className={classNames(
          'flex flex-col gap-3 pb-3 border-b border-hover',
          isCardSmall && 'border-none pb-0',
          (isFinished || !canOpenTask) && isCardSmall && '!pb-0'
        )}
      >
        <TaskHeader
          task={task}
          setAddSubtask={setAddSubtask}
          removeItem={removeItem}
          setAccordionValue={setAccordionValue}
        />
        <TaskContent task={task} />
      </div>
      {isCardMediumOrLarge && !isFinished && (
        <div
          style={{ userSelect: 'all' }}
          className={
            task.tags.length > 0 || canEditTags
              ? 'pb-3 border-b border-hover'
              : undefined
          }
        >
          <TaskProjectTag
            task={task}
            triggerClassName={'w-max'}
            insideContainer
            disabled={isFinished}
          />
        </div>
      )}
      <TaskFooter task={task} />
      {isShowAccordion && (
        <SubtasksAccordion
          task={task}
          isAddSubtask={isAddSubtask}
          setAddSubtask={setAddSubtask}
          value={accordionValue}
          setValue={setAccordionValue}
        />
      )}
    </div>
  )
})
