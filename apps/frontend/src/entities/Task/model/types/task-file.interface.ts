export interface ITaskFileOld {
  uuid: number
  name: string
  filePath: string
  dateCreated: Date
}

export type validImageExtension = 'png' | 'jpg' | 'jpeg'
export const validImageExtensions: validImageExtension[] = [
  'png',
  'jpg',
  'jpeg'
]
