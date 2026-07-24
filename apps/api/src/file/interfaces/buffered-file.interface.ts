import { ValidMimeType } from '../file-storage'

export interface BufferedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: ValidMimeType
  size: number
  buffer: Buffer | string
}
