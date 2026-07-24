import {
  ITaskFileOld,
  validImageExtension,
  validImageExtensions
} from '@/entities/Task/model/types/task-file.interface'

export function getDocFiles(files: ITaskFileOld[]): ITaskFileOld[] {
  return files.filter((f) => {
    const ext = getFileExtension(f.filePath)
    return !validImageExtensions.includes(ext as validImageExtension)
  })
}

export function getFilename(filePath: string): string {
  return filePath.split('/').at(-1) ?? ''
}

export function getImageFiles(files: ITaskFileOld[]): ITaskFileOld[] {
  return files.filter((f) => {
    const ext = getFileExtension(f.filePath)
    return validImageExtensions.includes(ext as validImageExtension)
  })
}

function getFileExtension(filePath: string): string {
  return filePath.split('.').at(-1) ?? ''
}
