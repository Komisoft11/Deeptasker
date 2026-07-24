import { Folder, ICreateFolderDTO } from '@/entities/Folder'
import { IUpdateFolderDTO } from '@/entities/Folder/model/types/folder.interface'
import axios from '@/shared/api/interceptors'
import { ICreatedRecord } from '@/shared/types/created-record.interface'

const getFolderUrl = (string: string = ''): string => `/folders${string}`

export const FolderService = {
  async create(dto: ICreateFolderDTO): Promise<ICreatedRecord> {
    return (await axios.post(getFolderUrl(), dto)).data
  },
  async update({ id, ...dto }: IUpdateFolderDTO): Promise<void> {
    return (await axios.patch(getFolderUrl(`/${id}`), dto)).data
  },
  async delete(folder: Folder): Promise<void> {
    return (await axios.delete(getFolderUrl(`/${folder.id}`))).data
  }
}
