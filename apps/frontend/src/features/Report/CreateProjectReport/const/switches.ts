import { ReportFields } from '@/entities/Report'

export type SwitchStateKeys = {
  label: string
  value: keyof ReportFields
}

export const LEFT_SWITCH_LABELS: SwitchStateKeys[] = [
  { label: 'ID задачи', value: 'taskId' },
  { label: 'Название задачи', value: 'name' },
  { label: 'Статус', value: 'status' },
  { label: 'Описание', value: 'description' },
  { label: 'Теги', value: 'tags' },
  { label: 'Дата создания', value: 'dateCreated' },
  { label: 'Дедлайн', value: 'dateDeadline' },
  { label: 'Дата завершения', value: 'dateExecuted' },
  { label: 'Просрочено времени', value: 'timeExpired' }
]

export const RIGHT_SWITCH_LABELS: SwitchStateKeys[] = [
  { label: 'Оценка времени', value: 'timeEstimate' },
  { label: 'Затраченное время', value: 'spentTime' },
  { label: 'Спринт', value: 'sprint' },
  { label: 'Исполнитель', value: 'executor' },
  { label: 'Ответственный', value: 'assigner' },
  { label: 'Наблюдатели', value: 'observers' },
  { label: 'Создатель', value: 'creator' },
  { label: 'Ссылки на файлы задачи', value: 'fileLinks' }
]

export const INITIAL_SWITCH_STATES: Record<keyof ReportFields, boolean> = {
  taskId: true,
  name: true,
  status: true,
  description: true,
  dateCreated: true,
  dateExecuted: true,
  sprint: true,
  timeExpired: true,
  executor: true,
  assigner: true,
  observers: true,
  fileLinks: true,
  tags: true,
  timeEstimate: true,
  spentTime: true,
  creator: true,
  dateDeadline: true
}
