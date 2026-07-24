import { UniqueIdentifier } from '@dnd-kit/core'

export interface KanbanItem {
  id: UniqueIdentifier
}

export type KanbanContainer = UniqueIdentifier

export type FilledContainers = Record<KanbanContainer, KanbanItem[]>
