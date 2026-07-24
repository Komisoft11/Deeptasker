import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import type { MeasuringConfiguration } from '@dnd-kit/core/dist/components/DndContext/types'
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useKanbanControlsContext } from '@/widgets/KanbanPlanner/context/KanbanControlsContext'
import { useKanban } from '@/widgets/KanbanPlanner/lib/hooks/useKanban'
import { KanbanContainer } from '@/widgets/KanbanPlanner/types/KanbanItem.interface'
import { DroppableContainer, Item } from '@/widgets/KanbanPlanner/ui'
import { AddStatusForm } from '@/widgets/KanbanPlanner/ui/AddStatusForm/AddStatusForm'
import { ITaskStatus, usePermissionProject } from '@/entities/Project'
import { Task } from '@/entities/Task'
import { viewTabs } from '@/shared/config/route.config'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './KanbanPlanner.module.scss'

const PLACEHOLDER_ID = 'placeholder'
const PADDING = 8

const measuring: MeasuringConfiguration = {
  droppable: { strategy: MeasuringStrategy.BeforeDragging }
}

export const KanbanPlanner = observer(() => {
  const { taskPlanerStore } = useRootStore()
  const { permissions } = usePermissionProject()

  const {
    containers,
    filledContainers,
    removeItemFromContainer,
    appendItemToContainer,
    appendContainer,
    removeContainer,
    duplicateContainer,
    moveItems,
    collisionDetectionStrategy,
    onDragStart,
    onDragOver,
    onDragEnd,
    isColumnDrag,
    activeId
  } = useKanban()

  const { isAddStatus, setIsAddStatus } = useKanbanControlsContext()

  const containerHeightRef = useRef<HTMLDivElement | null>(null)
  const [virtualListHeight, setVirtualListHeight] = useState(100)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 120,
        tolerance: 50
      }
    })
  )

  function handleCreateItem(
    id: UniqueIdentifier,
    containerId: UniqueIdentifier
  ) {
    appendItemToContainer(id, containerId)
  }

  function handleRemoveItem(
    id: UniqueIdentifier,
    containerId: KanbanContainer
  ) {
    removeItemFromContainer(id, containerId)
  }

  function handleCreateContainer(containerId: UniqueIdentifier) {
    appendContainer(containerId)
    setIsAddStatus(false)
  }

  function handleRemoveContainer(containerId: KanbanContainer) {
    removeContainer(containerId)
  }

  function handleDuplicateContainer(tasks: Task[], status: ITaskStatus) {
    duplicateContainer(tasks, status)
  }

  function handleMoveItems(
    fromContainer: KanbanContainer,
    toContainer: KanbanContainer
  ) {
    moveItems(fromContainer, toContainer)
  }

  useEffect(() => {
    if (containerHeightRef.current) {
      setVirtualListHeight(
        containerHeightRef.current.offsetHeight - PADDING * 2 - 57
      )
    }
    taskPlanerStore.view = viewTabs.KANBAN
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      autoScroll
      measuring={measuring}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      cancelDrop={() => !permissions.editTaskStatus}
    >
      <div
        ref={containerHeightRef}
        style={{
          userSelect: 'none'
        }}
        className={styles.container}
      >
        <SortableContext
          items={[...containers, PLACEHOLDER_ID]}
          strategy={horizontalListSortingStrategy}
        >
          {containers.map((containerId) => (
            <DroppableContainer
              key={containerId}
              id={containerId}
              items={filledContainers[containerId]}
              height={virtualListHeight}
              handle={false}
              getItemStyles={() => ({})}
              strategy={verticalListSortingStrategy}
              onRemoveItem={(id) => handleRemoveItem(id, containerId)}
              onCreateItem={(id) => handleCreateItem(id, containerId)}
              onRemoveContainer={() => handleRemoveContainer(containerId)}
              onDuplicateContainer={handleDuplicateContainer}
              onMoveItems={handleMoveItems}
            />
          ))}
          {isAddStatus && <AddStatusForm onCreate={handleCreateContainer} />}
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={false}>
          {isColumnDrag && activeId && (
            <Item id={activeId} handle={false} dragging />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
})
