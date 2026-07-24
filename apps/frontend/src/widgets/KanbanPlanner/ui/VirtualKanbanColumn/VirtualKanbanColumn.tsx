import { UniqueIdentifier } from '@dnd-kit/core'
import {
  VirtualItem,
  Virtualizer,
  useVirtualizer
} from '@tanstack/react-virtual'
import classNames from 'classnames'
import { FC, useRef } from 'react'
import { KanbanItem } from '@/widgets/KanbanPlanner/types/KanbanItem.interface'
import { DraggableItem } from '@/widgets/KanbanPlanner/ui'
import { AddTaskInput } from '@/entities/Task'
import styles from './VirtualKanbanColumn.module.scss'

type VirtualKanbanColumnProps = {
  items: KanbanItem[]
  height: number
  handle: boolean
  getItemStyles: any
  onRemove: (id: UniqueIdentifier) => void
  onCreate: (id: UniqueIdentifier) => void
  isAddTask: boolean
  containerId: UniqueIdentifier
}

const ITEM_GAP: number = 8
const ADD_INPUT_HEIGHT: number = 50
const ESTIMATE_SIZE: number = 230

export function VirtualKanbanColumn({
  items,
  height,
  handle,
  getItemStyles,
  onRemove,
  onCreate,
  isAddTask,
  containerId
}: VirtualKanbanColumnProps) {
  const parentRef = useRef<HTMLDivElement | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATE_SIZE,
    overscan: 5
  })

  return (
    <div
      ref={parentRef}
      className={classNames(styles.VirtualList, 'scrollbarContainerOnObjects')}
      style={{
        height,
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div
        style={{
          height:
            rowVirtualizer.getTotalSize() + (isAddTask ? ADD_INPUT_HEIGHT : 0),
          position: 'relative'
        }}
      >
        {isAddTask && (
          <div
            style={{
              padding: '1px',
              position: 'sticky',
              top: -50,
              zIndex: 2,
              height: 50,
              width: 320
            }}
          >
            <AddTaskInput
              onCreate={onCreate}
              autoFocus
              containerId={containerId as number}
            />
          </div>
        )}

        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <Item
            key={virtualRow.key}
            rowVirtualizer={rowVirtualizer}
            virtualRow={virtualRow}
            items={items}
            isAddTask={isAddTask}
            handle={handle}
            getItemStyles={getItemStyles}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}

interface ItemProps
  extends Pick<
    VirtualKanbanColumnProps,
    'items' | 'isAddTask' | 'handle' | 'getItemStyles' | 'onRemove'
  > {
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>
  virtualRow: VirtualItem
}

const Item: FC<ItemProps> = ({
  rowVirtualizer,
  virtualRow,
  items,
  isAddTask,
  handle,
  getItemStyles,
  onRemove
}) => (
  <div
    key={items[virtualRow.index].id}
    ref={rowVirtualizer.measureElement}
    data-index={virtualRow.index}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      transform: `translateY(${
        virtualRow.start + (isAddTask ? ADD_INPUT_HEIGHT : 0)
      }px)`
    }}
  >
    <DraggableItem
      id={items[virtualRow.index].id}
      index={virtualRow.index}
      handle={handle}
      wrapperStyle={() => ({
        paddingBottom: ITEM_GAP
      })}
      style={getItemStyles}
      onRemove={() => onRemove(items[virtualRow.index].id)}
    />
  </div>
)
