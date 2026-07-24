import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UseMutationResult } from '@tanstack/react-query/src/types'
import { runInAction } from 'mobx'
import { commentQueries } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/api/comment'
import { Task } from '@/entities/Task'
import {
  CreateCommentParams,
  FileData,
  ITaskComment,
  ITaskCommentReactDto,
  UpdateCommentParams
} from '@/entities/TaskComment/model/types/task-comment.interface'
import { TaskCommentService } from '@/entities/TaskComment/services/task.comment.service'
import { IUser } from '@/entities/User'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ICreatedRecord } from '@/shared/types/created-record.interface'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

interface IReturn {
  comments: ITaskComment[] | undefined
  createAsync: UseMutationResult<{ id: number }, unknown, CreateCommentParams>
  updateAsync: UseMutationResult<void, unknown, UpdateCommentParams>
  deleteCommentAsync: UseMutationResult<
    void,
    unknown,
    { taskComment: ITaskComment; task: Task }
  >
  addReactionAsync: UseMutationResult<
    ICreatedRecord,
    unknown,
    {
      taskId: number
      comment: ITaskComment
      dto: ITaskCommentReactDto
      user: IUser
    }
  >
  deleteReactionAsync: UseMutationResult<
    void,
    unknown,
    { taskId: number; comment: ITaskComment; reactionId: number }
  >
  uploadFileAsync: UseMutationResult<
    { id: number },
    unknown,
    {
      commentId: number
      formData: FormData
    }
  >
  deleteFileAsync: UseMutationResult<
    void,
    unknown,
    { comment: ITaskComment; fileId: number }
  >
  isLoading: boolean
}

export const useComment = (task: Task): IReturn => {
  const {
    taskStore,
    authStore: { user }
  } = useRootStore()
  const {
    data: comments,
    refetch,
    isLoading
  } = useQuery({
    queryKey: commentQueries.comments(task).queryKey,
    queryFn: commentQueries.comments(task).queryFn,
    enabled: !!task
  })

  const ql = useQueryClient()

  const {
    taskCommentStore: { editTaskComment }
  } = useRootStore()

  const createAsync = useCreateMutation<
    { id: number },
    unknown,
    CreateCommentParams
  >({
    mutationKey: ['create comment'],
    mutationFn: async ({
      comment,
      task,
      replyId
    }: CreateCommentParams): Promise<{ id: number }> => {
      const { id } = await TaskCommentService.create({
        comment,
        taskId: task.id,
        files: [],
        replyId
      })

      return { id }
    },
    onSuccess: async ({ id }, { files, comment, task, replyId }) => {
      let uploadedFiles: FileData[] = []

      taskStore.incrementCommentCounter(task)

      if (files?.length > 0) {
        uploadedFiles = await Promise.all(
          files.map(async (file) => {
            const formData = new FormData()
            formData.append('file', file.file)

            const uploaded = await TaskCommentService.uploadFile(id, formData)

            if (uploaded && uploaded.id) {
              return {
                id: uploaded.id,
                originalName: file.file.name,
                size: file.file.size,
                dateCreated: uploaded.dateCreated
                  ? new Date(uploaded.dateCreated)
                  : new Date(),
                file: file.file
              } as FileData
            }

            return {
              originalName: file.file.name,
              size: file.file.size,
              dateCreated: new Date(),
              file: file.file
            } as FileData
          })
        )
      }

      const newComment: ITaskComment = {
        id: id,
        user: user,
        content: comment,
        reactions: [],
        files: uploadedFiles ?? [],
        replyId: replyId ?? null,
        dateCreated: new Date(),
        dateUpdated: null,
        dateDeleted: null
      }

      const key = commentQueries.comments(task).queryKey

      ql.setQueryData<ITaskComment[]>(key, (old) =>
        old ? [...old, newComment] : [newComment]
      )

      task.comments.push(newComment)
    }
  })

  const updateAsync = useCreateMutation<void, unknown, UpdateCommentParams>({
    mutationKey: ['update comment'],
    mutationFn: async ({
      task,
      comment
    }: UpdateCommentParams): Promise<void> => {
      if (!editTaskComment) throw new Error('not found activeTaskComment')
      editTaskComment.content = comment
      return TaskCommentService.update(task.id, editTaskComment)
    },
    onSuccess: (_, { task, comment }) => {
      ql.setQueryData<ITaskComment[]>(
        commentQueries.comments(task).queryKey,
        (oldData = []) =>
          oldData.map((c) =>
            c.id === editTaskComment!.id
              ? { ...c, content: comment, dateUpdated: new Date() }
              : c
          )
      )
    }
  })

  const deleteCommentAsync = useCreateMutation<
    void,
    unknown,
    { taskComment: ITaskComment; task: Task }
  >({
    mutationKey: ['delete comment'],
    mutationFn: async ({
      taskComment,
      task
    }: {
      taskComment: ITaskComment
      task: Task
    }): Promise<void> => {
      await TaskCommentService.delete(task.id, taskComment.id)
    },
    onSuccess: (_, { task, taskComment }) => {
      taskStore.decrementCommentCounter(task)

      runInAction(() => {
        task.comments = task.comments.filter((tC) => tC.id !== taskComment.id)
      })
      ql.setQueryData<ITaskComment[]>(
        commentQueries.comments(task).queryKey,
        (oldData = []) => oldData.filter((c) => c.id !== taskComment.id)
      )
      showToast({ type: 'success', title: 'Ваш комментарий успешно удалён' })
    },
    onError: () => {
      showToast({ type: 'error', title: 'Ошибка при удалении комментария' })
    }
  })

  const addReactionAsync = useCreateMutation<
    ICreatedRecord,
    unknown,
    {
      taskId: number
      comment: ITaskComment
      dto: ITaskCommentReactDto
      user: IUser
    }
  >({
    mutationKey: ['add reaction'],
    mutationFn: async ({
      taskId,
      comment,
      dto
    }: {
      taskId: number
      comment: ITaskComment
      dto: ITaskCommentReactDto
    }): Promise<ICreatedRecord> => {
      return await TaskCommentService.addReaction(taskId, comment, dto)
    },
    onSuccess: async () => {
      await refetch()
    }
  })

  const deleteReactionAsync = useCreateMutation<
    void,
    unknown,
    { taskId: number; comment: ITaskComment; reactionId: number }
  >({
    mutationKey: ['delete reaction'],
    mutationFn: async ({
      taskId,
      comment,
      reactionId
    }: {
      taskId: number
      comment: ITaskComment
      reactionId: number
    }): Promise<void> => {
      await TaskCommentService.deleteReaction(taskId, comment, reactionId)
    },
    onSuccess: (_, { taskId, comment, reactionId }) => {
      ql.setQueryData<ITaskComment[]>(
        commentQueries.comments(taskStore.get(taskId)).queryKey,
        (old) =>
          old
            ? old.map((c) =>
                c.id === comment.id
                  ? {
                      ...c,
                      reactions: c.reactions.filter((r) => r.id !== reactionId)
                    }
                  : c
              )
            : old
      )
    }
  })

  const uploadFileAsync = useCreateMutation<
    { id: number },
    unknown,
    { commentId: number; formData: FormData }
  >({
    mutationKey: ['upload file'],
    mutationFn: async ({
      commentId,
      formData
    }: {
      commentId: number
      formData: FormData
    }): Promise<{ id: number }> => {
      return await TaskCommentService.uploadFile(commentId, formData)
    },
    onSuccess: () => {
      refetch()
    }
  })

  const deleteFileAsync = useCreateMutation<
    void,
    unknown,
    { comment: ITaskComment; fileId: number }
  >({
    mutationKey: ['delete file'],
    mutationFn: async ({ comment, fileId }) => {
      await TaskCommentService.deleteFile(comment.id, fileId)
    },
    onSuccess: (_, { comment, fileId }) => {
      ql.setQueryData<ITaskComment[]>(
        commentQueries.comments(taskStore.activeTask).queryKey,
        (old) =>
          old
            ? old.map((c) =>
                c.id === comment.id
                  ? { ...c, files: c.files.filter((f) => f.id !== fileId) }
                  : c
              )
            : old
      )

      showToast({
        title: 'Вы успешно удалили файл',
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при удалении файла',
        type: 'error'
      })
    }
  })

  return {
    comments,
    createAsync,
    updateAsync,
    deleteCommentAsync,
    addReactionAsync,
    deleteReactionAsync,
    uploadFileAsync,
    deleteFileAsync,
    isLoading
  }
}
