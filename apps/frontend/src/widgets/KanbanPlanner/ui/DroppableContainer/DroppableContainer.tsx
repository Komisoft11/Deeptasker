import { UniqueIdentifier } from '@dnd-kit/core'
import {
  AnimateLayoutChanges,
  SortingStrategy,
  defaultAnimateLayoutChanges,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CSSProperties, useState } from 'react'
import {
  KanbanContainer,
  KanbanItem
} from '@/widgets/KanbanPlanner/types/KanbanItem.interface'
import { VirtualKanbanColumn } from '@/widgets/KanbanPlanner/ui'
import { Container } from '@/widgets/KanbanPlanner/ui/Container/Container'
import { ITaskStatus } from '@/entities/Project'
import { Task } from '@/entities/Task'

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

type DroppableContainerProps = {
  id: UniqueIdentifier
  items: KanbanItem[]
  columns?: number
  height: number
  handle: boolean
  getItemStyles: any
  strategy: SortingStrategy
  onRemoveItem: (id: UniqueIdentifier) => void
  onCreateItem: (id: UniqueIdentifier) => void
  disabled?: boolean
  style?: CSSProperties
  scrollable?: boolean
  onRemoveContainer?: () => void
  onDuplicateContainer?(tasks: Task[], status: ITaskStatus): void
  onMoveItems?(
    fromContainer: KanbanContainer,
    toContainer: KanbanContainer
  ): void
}

export function DroppableContainer({
  columns = 1,
  disabled,
  id,
  items,
  height,
  handle,
  getItemStyles,
  strategy,
  onRemoveItem,
  onCreateItem,
  style,
  ...props
}: DroppableContainerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    over,
    active
  } = useSortable({
    id,
    data: { type: 'container' },
    animateLayoutChanges
  })
  const [isAddTask, setIsAddTask] = useState(false)

  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') ||
      items.includes(over.id as unknown as KanbanItem)
    : false

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Transform.toString(transform)
      }}
      handleProps={{ ...attributes, ...listeners }}
      columns={columns}
      hover={isOverContainer}
      isAddTask={isAddTask}
      setIsAddTask={setIsAddTask}
      id={id}
      items={items}
      {...props}
    >
      <VirtualKanbanColumn
        containerId={id}
        items={items}
        height={height}
        handle={handle}
        getItemStyles={getItemStyles}
        onRemove={onRemoveItem}
        onCreate={(id) => {
          onCreateItem(id)
          setIsAddTask(false)
        }}
        isAddTask={isAddTask}
      />
    </Container>
  )
}
