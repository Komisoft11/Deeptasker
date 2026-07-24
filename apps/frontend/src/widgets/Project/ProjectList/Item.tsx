import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'
import classNames from 'classnames'
import React, { useEffect } from 'react'
import styles from './Item.module.scss'

export interface Props {
  dragOverlay?: boolean
  color?: string
  disabled?: boolean
  dragging?: boolean
  index?: number
  fadeIn?: boolean
  transform?: Transform | null
  listeners?: DraggableSyntheticListeners
  transition?: string | null
  value: React.ReactNode
}

export const Item = React.forwardRef<HTMLLIElement, Props>(
  (
    {
      dragOverlay,
      dragging,
      disabled,
      fadeIn,
      index,
      listeners,
      transition,
      transform,
      value,
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
      <li
        className={classNames(
          styles.Wrapper,
          dragOverlay && styles.dragOverlay
        )}
        style={
          {
            transition,
            '--translate-x': transform
              ? `${Math.round(transform.x)}px`
              : undefined,
            '--translate-y': transform
              ? `${Math.round(transform.y)}px`
              : undefined,
            '--scale-x': transform?.scaleX ? `${transform.scaleX}` : undefined,
            '--scale-y': transform?.scaleY ? `${transform.scaleY}` : undefined
          } as React.CSSProperties
        }
        ref={ref}
      >
        <div
          className={classNames(
            styles.Item,
            dragging && styles.dragging,
            dragOverlay && styles.dragOverlay,
            disabled && 'disabled-30'
          )}
          {...listeners}
          {...props}
        >
          {value}
        </div>
      </li>
    )
  }
)
