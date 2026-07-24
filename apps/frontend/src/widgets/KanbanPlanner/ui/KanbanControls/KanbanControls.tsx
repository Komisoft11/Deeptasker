import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useKanbanControlsContext } from '@/widgets/KanbanPlanner'
import { SprintFilterPopover } from '@/entities/Sprint/ui/SprintFilterPopover/SprintFilterPopover'
import { CardSize } from '@/entities/TaskPlanner'
import { Close, Plus } from '@/shared/assets/images/icons'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'


export const KanbanControls = observer(() => {
  const { t } = useTranslation(TRANSLATION)
  const {
    projectStore: { currentUserPermissionsProject },
    taskPlanerStore,
    taskStore: { tasks }
  } = useRootStore()

  const {
    permissions: { edit: canEditProject }
  } = currentUserPermissionsProject

  const { isAddStatus, setIsAddStatus } = useKanbanControlsContext()

  const handleChangeCardSize = (newSize: CardSize) => {
    taskPlanerStore.cardSize = newSize
  }

  const handleAddStatus = () => {
    setIsAddStatus((prev) => !prev)
  }

  const cardSizes = [
    {
      size: 'S',
      className: 'rounded-br-none rounded-tr-none w-10 h-10'
    },
    {
      size: 'M',
      className: 'rounded-none w-10 h-10'
    },
    {
      size: 'L',
      className: 'rounded-bl-none rounded-tl-none w-10 h-10'
    }
  ]

  const isCardSizesVisible = tasks.length > 0

  return (
    <div className={'flex gap-3 w-full items-center justify-end'}>
      <SprintFilterPopover />
      {isCardSizesVisible && (
        <div
          className={classNames(
            'flex px-3 items-center gap-2 border-border border-l',
            canEditProject && 'border-r'
          )}
        >
          <p className={'secondaryText body-14-16 w-max'}>Размер карточек</p>
          <div className={'flex'}>
            {cardSizes.map((cardSize) => (
              <Button
                key={cardSize.size}
                styleButton={'outline'}
                className={classNames(
                  cardSize.className,
                  taskPlanerStore.cardSize === cardSize.size &&
                    'bg-accent hover:!bg-accent text-activeText'
                )}
                onClick={() => handleChangeCardSize(cardSize.size as CardSize)}
              >
                {cardSize.size}
              </Button>
            ))}
          </div>
        </div>
      )}

      {canEditProject && (
        <Button
          styleButton={'filled'}
          className={'py-[10px] px-4 body-14-20'}
          icon={
            !isAddStatus ? (
              <Plus className={'w-5 h-5'} />
            ) : (
              <Close className={'w-5 h-5'} />
            )
          }
          onClick={handleAddStatus}
        >
          {!isAddStatus ? t('addDesk') : t('cancel')}
        </Button>
      )}
    </div>
  )
})
