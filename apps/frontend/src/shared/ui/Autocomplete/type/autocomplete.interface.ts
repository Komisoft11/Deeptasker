import { ReactNode } from 'react'

export interface IOption<Entity extends Object = Object> {
  entity: Entity
  label: ReactNode
  value: string | null
}
