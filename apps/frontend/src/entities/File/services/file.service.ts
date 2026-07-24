import { IAvatar, IFileTask } from '@/entities/File/model/types/file.interface'
import { Task } from '@/entities/Task'
import axios from '@/shared/api/interceptors'
import { API_URL } from '@/shared/config/api.config'

const getFileUrl = (string: string) => `/file/${string}`

export const FileService = {
  async uploadImageTask(task: Task, formData: FormData): Promise<IFileTask> {
    return (
      await axios.post<IFileTask>(
        getFileUrl(`task/${task.id}/upload`),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
    ).data
  },
  async delete(task: Task, fileId: number): Promise<void> {
    return (await axios.delete<void>(getFileUrl(`task/${task.id}/${fileId}`)))
      .data
  },
  async getUrl(task: Task, fileId: number): Promise<Blob> {
    return (
      await axios.get(getFileUrl(`task/${task.id}/${fileId}`), {
        responseType: 'blob'
      })
    ).data
  },
  fileUrl(task: Task, fileId: number): string {
    return API_URL + getFileUrl(`task/${task.id}/${fileId}`)
  },

  downloadReportUrl(reportId: number): string {
    return API_URL + getFileUrl(`report/${reportId}`)
  },

  async uploadAvatar(formData: FormData): Promise<IAvatar> {
    return (
      await axios.post<IAvatar>(getFileUrl(`user-avatar/upload`), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    ).data
  },

  async deleteAvatar(fileId: number): Promise<void> {
    return (await axios.delete<void>(getFileUrl(`user-avatar/${fileId}`))).data
  },

  getAvatar(fileId: number): string {
    return API_URL + getFileUrl(`user-avatar/${fileId}`)
  }
}
