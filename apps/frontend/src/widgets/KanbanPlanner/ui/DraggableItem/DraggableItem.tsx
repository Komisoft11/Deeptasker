import {
  Active,
  CollisionDetection,
  DropAnimation,
  KeyboardCoordinateGetter,
  MeasuringConfiguration,
  Modifiers,
  PointerActivationConstraint,
  UniqueIdentifier,
  useDraggable
} from '@dnd-kit/core'
import {
  AnimateLayoutChanges,
  NewIndexGetter,
  SortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import React, { FC } from 'react'
import { Item } from '@/widgets/KanbanPlanner/ui/Item/Item'

export interface Props {
  activationConstraint?: PointerActivationConstraint
  animateLayoutChanges?: AnimateLayoutChanges
  adjustScale?: boolean
  collisionDetection?: CollisionDetection
  coordinateGetter?: KeyboardCoordinateGetter
  Container?: any
  dropAnimation?: DropAnimation | null
  getNewIndex?: NewIndexGetter
  handle?: boolean
  itemCount?: number
  items?: UniqueIdentifier[]
  measuring?: MeasuringConfiguration
  modifiers?: Modifiers
  renderItem?: any
  removable?: boolean
  reorderItems?: typeof arrayMove
  strategy?: SortingStrategy
  style?: React.CSSProperties
  useDragOverlay?: boolean
  getItemStyles?(args: {
    id: UniqueIdentifier
    index: number
    isSorting: boolean
    isDragOverlay: boolean
    overIndex: number
    isDragging: boolean
  }): React.CSSProperties
  wrapperStyle?(args: {
    active: Pick<Active, 'id'> | null
    index: number
    isDragging: boolean
    id: UniqueIdentifier
  }): React.CSSProperties
  isDisabled?(id: UniqueIdentifier): boolean
  cardRef?: React.Ref<HTMLDivElement>
}

interface SortableItemProps {
  disabled?: boolean
  id: UniqueIdentifier
  index: number
  handle: boolean
  onRemove?(): void
  style(values: any): React.CSSProperties
  wrapperStyle: Props['wrapperStyle']
}
export const DraggableItem: FC<SortableItemProps> = ({
  disabled,
  handle,
  id,
  index,
  style,
  wrapperStyle,
  onRemove
}) => {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform
  } = useDraggable({
    id,
    disabled
  })

  return (
    <Item
      id={id}
      ref={setNodeRef}
      disabled={disabled}
      sorting={false}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      style={style({
        index,
        id,
        isDragging
      })}
      onRemove={onRemove}
      transform={transform}
      wrapperStyle={wrapperStyle?.({ index, isDragging, active, id })}
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={isDragging}
      {...attributes}
    />
  )
}
