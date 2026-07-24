import { UniqueIdentifier } from '@dnd-kit/core'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { forwardRef } from 'react'
import {
  KanbanContainer,
  KanbanItem
} from '@/widgets/KanbanPlanner/types/KanbanItem.interface'
import { StatusHeader } from '@/features/TaskKanban'
import { ITaskStatus } from '@/entities/Project'
import { Task } from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './Container.module.scss'

export interface Props {
  children: React.ReactNode
  columns?: number
  style?: React.CSSProperties
  horizontal?: boolean
  hover?: boolean
  handleProps?: React.HTMLAttributes<any>
  scrollable?: boolean
  shadow?: boolean
  placeholder?: boolean
  unstyled?: boolean
  onClick?(): void
  onRemove?(): void
  id: UniqueIdentifier
  isAddTask: boolean
  setIsAddTask: (isAddTask: boolean) => void
  onRemoveContainer?: () => void
  onDuplicateContainer?(tasks: Task[], status: ITaskStatus): void
  onMoveItems?(
    fromContainer: KanbanContainer,
    toContainer: KanbanContainer
  ): void
  items: KanbanItem[]
}

interface SafeRenderStatusHeaderProps {
  id: UniqueIdentifier
  isAddTask: boolean
  setIsAddTask: (isAddTask: boolean) => void
  handleProps?: React.HTMLAttributes<any>
  isDragOverlay: boolean
  isHovered: boolean
  onRemoveContainer?: () => void
  onDuplicateContainer?(tasks: Task[], status: ITaskStatus): void
  onMoveItems?(
    fromContainer: KanbanContainer,
    toContainer: KanbanContainer
  ): void
  items: KanbanItem[]
}

const SafeRenderStatusHeader = observer(
  (props: SafeRenderStatusHeaderProps) => {
    const { projectStore } = useRootStore()
    const status = projectStore.activeProject.statuses.find(
      (s) => s.id === props.id
    )
    return status ? <StatusHeader {...props} /> : <></>
  }
)

export const Container = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      columns = 1,
      handleProps,
      horizontal,
      hover,
      onClick,
      onRemove,
      placeholder,
      style,
      scrollable,
      shadow,
      unstyled,
      id,
      isAddTask,
      setIsAddTask,
      onRemoveContainer,
      onDuplicateContainer,
      onMoveItems,
      items,
      ...props
    }: Props,
    ref
  ) => {
    const Component = onClick ? 'button' : 'div'

    return (
      <Component
        {...props}
        ref={ref as any}
        style={
          {
            ...style,
            '--columns': columns
          } as React.CSSProperties
        }
        className={classNames(
          styles.Container,
          unstyled && styles.unstyled,
          horizontal && styles.horizontal,
          hover && styles.hover,
          placeholder && styles.placeholder,
          scrollable && styles.scrollable,
          shadow && styles.shadow
        )}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        <SafeRenderStatusHeader
          id={id}
          isAddTask={isAddTask}
          setIsAddTask={setIsAddTask}
          isDragOverlay={false}
          isHovered={false}
          onRemoveContainer={onRemoveContainer}
          onDuplicateContainer={onDuplicateContainer}
          onMoveItems={onMoveItems}
          items={items}
        />
        {children}
      </Component>
    )
  }
)
