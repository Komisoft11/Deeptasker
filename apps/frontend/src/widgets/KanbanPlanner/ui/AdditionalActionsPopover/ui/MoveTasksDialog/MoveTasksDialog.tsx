import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  KanbanContainer,
  KanbanItem
} from '@/widgets/KanbanPlanner/types/KanbanItem.interface'
import { ITaskStatus } from '@/entities/Project'
import { useTasks } from '@/entities/Task'
import { Services } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'


interface Props {
  clickedStatus: ITaskStatus
  items: KanbanItem[]
  onSubmitClick: () => void
  onMoveItems?(
    fromContainer: KanbanContainer,
    toContainer: KanbanContainer
  ): void
}

export const MoveTasksDialog = ({
  clickedStatus,
  items,
  onSubmitClick,
  onMoveItems
}: Props) => {
  const { t } = useTranslation([ENTITY])
  const {
    projectStore: { activeProject }
  } = useRootStore()
  const { moveTasksToNewStatus } = useTasks()
  const [activeStatus, setActiveStatus] = useState<ITaskStatus | null>(null)
  const [statusError, setStatusError] = useState('')

  const handleMove = async () => {
    if (!activeStatus) {
      setStatusError('Выберите куда переместить задачи')
    } else {
      await moveTasksToNewStatus.mutateAsync({
        sourceStatusId: clickedStatus.id,
        projectId: activeProject.id,
        targetStatusId: activeStatus.id
      })
      onSubmitClick()
      onMoveItems?.(clickedStatus.id, activeStatus.id)
    }
  }

  return (
    <>
      <div className={'flex flex-col gap-1'}>
        <h3>
          {activeProject.title} · {t(clickedStatus.name)} · {items.length}
        </h3>
        <p className={'body-12 secondaryText'}>
          {t('kanban.board.moveTasksQuestion', { ns: ENTITY })}
        </p>
      </div>
      <div className={'flex gap-2 flex-wrap'}>
        {activeProject.statuses
          .filter((activeStatus) => activeStatus.id !== clickedStatus.id)
          .map((status) => (
            <div
              className={classNames(
                'flex justify-between gap-2 p-3 bg-hover w-[180px] rounded-lg hover:bg-hoverOnHover hover:cursor-pointer border border-transparent',
                activeStatus &&
                  activeStatus.id === status.id &&
                  '!border-accent',
                statusError && '!border-systemRed'
              )}
              key={status.id}
              onClick={() => {
                setStatusError('')
                setActiveStatus(status)
              }}
            >
              <div className={'flex gap-2 items-center'}>
                <div
                  className={'w-[10px] h-[10px] rounded-full shrink-0'}
                  style={{
                    backgroundColor: `${status.color}`,
                    boxShadow: `0 0 6.9px 0 ${status.color}`
                  }}
                />
                <h4 className={'w-[calc(180px-40px)] ellipsis'}>
                  {t(status.name)}
                </h4>
              </div>
            </div>
          ))}
      </div>
      <div className={'pt-6 flex flex-col gap-2'}>
        {statusError && (
          <p className={'text-systemRed body-12'}>{statusError}</p>
        )}
        <Button
          styleButton={'filled'}
          colorButton={'accent'}
          className={'px-4 max-w-max'}
          icon={<Services className={'w-4 h-4 body-14-16'} />}
          onClick={handleMove}
        >
          {t('kanban.board.moveTasks', { ns: ENTITY })}
        </Button>
      </div>
    </>
  )
}
