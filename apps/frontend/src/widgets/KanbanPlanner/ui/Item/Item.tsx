import type {
  DraggableSyntheticListeners,
  UniqueIdentifier
} from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { Card } from '@/widgets/KanbanPlanner/ui/Item/Card/Card'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './Item.module.scss'

export interface Props {
  dragOverlay?: boolean
  color?: string
  disabled?: boolean
  dragging?: boolean
  handle?: boolean
  handleProps?: any
  height?: number
  index?: number
  fadeIn?: boolean
  transform?: Transform | null
  listeners?: DraggableSyntheticListeners
  sorting?: boolean
  style?: React.CSSProperties
  wrapperStyle?: React.CSSProperties
  onRemove?(): void
  id: UniqueIdentifier
}

const SafeRenderCard = observer(
  ({ id, onRemove }: { id: UniqueIdentifier; onRemove?(): void }) => {
    const { taskStore } = useRootStore()
    const task = taskStore.getWithoutError(Number(id))
    return task ? <Card task={task} removeItem={onRemove} /> : <></>
  }
)

export const Item = React.memo(
  React.forwardRef<HTMLDivElement, Props>(
    (
      {
        id,
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        height,
        index,
        listeners,
        onRemove,
        sorting,
        style,
        transform,
        wrapperStyle,
        ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return
        }

        document.body.style.cursor = 'grabbing'

        return () => {
          document.body.style.cursor = ''
        }
      }, [dragOverlay])

      return (
        <div
          ref={ref}
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting
          )}
          style={wrapperStyle}
        >
          <div
            className={classNames(
              styles.Item,
              handle && styles.withHandle,
              disabled && styles.disabled,
              color && styles.color,
              dragging && styles.dragging,
              dragOverlay && styles.dragOverlay
            )}
            style={style}
            data-cypress='draggable-item'
            {...(!handle ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            <SafeRenderCard id={id} onRemove={onRemove} />
          </div>
        </div>
      )
    }
  )
)
