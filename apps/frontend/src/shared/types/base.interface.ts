import { Ref } from 'react'

export interface IBase {
  id: number
  dateCreated: Date
  dateUpdated: Date | null
}

export interface HasRootRef<T> {
  getRootRef?: Ref<T>
}
