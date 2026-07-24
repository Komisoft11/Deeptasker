import { Task } from '@/entities/Task'
import {
  ITaskComment,
  ITaskCommentCreateDto,
  ITaskCommentReactDto
} from '@/entities/TaskComment/model/types/task-comment.interface'
import axios from '@/shared/api/interceptors'
import { API_URL } from '@/shared/config/api.config'
import { ICreatedRecord } from '@/shared/types/created-record.interface'


const getTaskCommentUrl = (taskId: number, string: string = '') =>
  `tasks/${taskId}/comments${string}`
const getFilesUrl = (commentId: number, string: string = '') =>
  `file/task-comment/${commentId}${string}`

export const TaskCommentService = {
  async getComments(task: Task): Promise<ITaskComment[]> {
    return (await axios.get(getTaskCommentUrl(task.id))).data
  },

  async create(dto: ITaskCommentCreateDto): Promise<ICreatedRecord> {
    return (await axios.post(getTaskCommentUrl(dto.taskId), dto)).data
  },

  async update(taskId: number, comment: ITaskComment): Promise<void> {
    return (
      await axios.patch(getTaskCommentUrl(taskId, `/${comment.id}`), {
        comment: comment.content
      })
    ).data
  },

  async addReaction(
    taskId: number,
    comment: ITaskComment,
    dto: ITaskCommentReactDto
  ): Promise<ICreatedRecord> {
    return (
      await axios.post(getTaskCommentUrl(taskId, `/${comment.id}/react`), dto)
    ).data
  },

  async deleteReaction(
    taskId: number,
    comment: ITaskComment,
    reactionId: number
  ): Promise<void> {
    return (
      await axios.delete(
        getTaskCommentUrl(taskId, `/${comment.id}/react/${reactionId}`)
      )
    ).data
  },

  async delete(taskId: number, commentId: number): Promise<void> {
    return (await axios.delete(getTaskCommentUrl(taskId, `/${commentId}`))).data
  },

  async getByTask(taskId: number): Promise<ITaskComment[]> {
    return (await axios.get(getTaskCommentUrl(taskId))).data
  },

  async uploadFile(
    commentId: number,
    formData: FormData
  ): Promise<ICreatedRecord> {
    return (
      await axios.post(getFilesUrl(commentId, '/upload'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    ).data
  },

  getUrl(comment: ITaskComment, fileId: number): string {
    return `${API_URL}/${getFilesUrl(comment.id, `/${fileId}`)}`
  },

  async deleteFile(commentId: number, fileId: number): Promise<void> {
    return (await axios.delete(getFilesUrl(commentId, `/${fileId}`))).data
  }
}
