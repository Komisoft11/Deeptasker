import { UniqueIdentifier } from '@dnd-kit/core'
import { ReactNode } from 'react'

export interface IBreadcrumb {
  id: UniqueIdentifier
  icon?: ReactNode
  title: string
  url?: string
  onClick?: () => void
}
