import {
  ContainerNameView,
  ElementNameView
} from '@/entities/Sidebar/model/types/sidebar.interface'

export const sidebarView: Record<ContainerNameView, ContainerNameView> = {
  reports: 'reports',
  tasks: 'tasks'
}

export const elementView: Record<ElementNameView, ElementNameView> = {
  project: 'project',
  settings: 'settings'
}
