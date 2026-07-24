export interface IFileTask {
  id: number
  originalName?: string
  name?: string
  file: File
}

export interface IAvatar {
  id: number
  originalName: string
  filePath: string
  size: number
  dateCreated: Date
}
