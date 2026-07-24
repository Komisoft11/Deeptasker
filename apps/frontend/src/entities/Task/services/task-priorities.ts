import { ThemeType } from '@/entities/lib/stores/theme-mode.store'

export interface IPriorityOption {
  label: string
  value: number
  colorBg: string
  colorFg: string
}

const defaultPriority: IPriorityOption = {
  label: 'priorities.none',
  value: 0,
  colorBg: 'transparent',
  colorFg: '#303640'
}

export const priorityOptions: IPriorityOption[] = [
  defaultPriority,
  {
    label: 'priorities.low',
    value: 1,
    colorBg: '#2C4B9B',
    colorFg: '#303640'
  },
  {
    label: 'priorities.medium',
    value: 2,
    colorBg: '#F3A965',
    colorFg: '#303640'
  },
  {
    label: 'priorities.high',
    value: 3,
    colorBg: '#C75343',
    colorFg: '#FFF'
  }
]

function applyDarkThemeColors(priorityOption: IPriorityOption) {
  switch (priorityOption.value) {
    case 0:
      priorityOption.colorFg = '#FFF'
      break
  }
}

export const findPriority = (
  priority: number,
  themeType: ThemeType
): IPriorityOption => {
  const priorityOption = priorityOptions[priority] ?? defaultPriority

  if (themeType === ThemeType.dark) {
    applyDarkThemeColors(priorityOption)
  }

  return priorityOption
}
