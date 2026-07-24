export const TAB = {
  DESCRIPTION: 'description',
  SUBTASKS: 'subtasks',
  COMMENTS: 'comments',
  FILES: 'files',
  TIME: 'time'
} as const

export type TabKey = (typeof TAB)[keyof typeof TAB]

export const allTabs: TabKey[] = [
  TAB.DESCRIPTION,
  TAB.SUBTASKS,
  TAB.COMMENTS,
  TAB.FILES,
  TAB.TIME
]