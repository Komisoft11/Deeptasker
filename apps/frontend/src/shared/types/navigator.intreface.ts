import { UniqueIdentifier } from '@dnd-kit/core'
import {
  ViewTabs,
  optionProjectTabs,
  settings
} from '@/shared/config/route.config'

export interface IUrlOptions {
  view?: ViewTabs
  params?: URLSearchParams
  folderId?: UniqueIdentifier
}

export type TabOptions =
  (typeof optionProjectTabs)[keyof typeof optionProjectTabs]
export type SettingsOptions = (typeof settings)[keyof typeof settings]
