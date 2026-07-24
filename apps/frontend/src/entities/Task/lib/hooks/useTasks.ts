import { UseMutationResult } from '@tanstack/react-query/src/types'
import { IFileTask } from '@/entities/File/model/types/file.interface'
import { FileService } from '@/entities/File/services/file.service'
import { TaskStatusCodeDefault } from '@/entities/Project'
import {
  AssignObserverRequest,
  AssignUserRequest,
  BindTaskRequest,
  MoveTaskRequest,
  MoveTasksToNewStatusRequest,
  MoveTasksToNewStatusResponse,
  ReassignUserResponse,
  TagRequest,
  Task,
  TaskChangeFolderRequest,
  TaskChangeProjectRequest,
  TaskCreateRequest,
  TaskUpdateFieldsRequest
} from '@/entities/Task'
import { TaskService } from '@/entities/Task/services/task.service'
import { FileData } from '@/entities/TaskComment/model/types/task-comment.interface'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ICreatedRecord } from '@/shared/types/created-record.interface'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

interface IReturn {
  deleteAsync: UseMutationResult<void, unknown, Task>
  createAsync: UseMutationResult<ICreatedRecord, unknown, TaskCreateRequest>
  unbindTaskAsync: UseMutationResult<void, unknown, BindTaskRequest>
  bindTaskAsync: UseMutationResult<void, unknown, BindTaskRequest>
  moveTaskAsync: UseMutationResult<void, unknown, MoveTaskRequest>
  updateAsync: UseMutationResult<void, unknown, TaskUpdateFieldsRequest>
  assignUserAsync: UseMutationResult<void, unknown, AssignUserRequest>
  reassignUserAsync: UseMutationResult<ReassignUserResponse, unknown, Task>
  changeProjectAsync: UseMutationResult<void, unknown, TaskChangeProjectRequest>
  assignObserverAsync: UseMutationResult<void, unknown, AssignObserverRequest>
  reassignObserverAsync: UseMutationResult<void, unknown, AssignObserverRequest>
  updateAssigner: UseMutationResult<void, unknown, AssignUserRequest>
  changeFolderAsync: UseMutationResult<void, unknown, TaskChangeFolderRequest>
  removeFolderAsync: UseMutationResult<void, unknown, number>
  moveTasksToNewStatus: UseMutationResult<
    MoveTasksToNewStatusResponse,
    unknown,
    MoveTasksToNewStatusRequest
  >
  addTagAsync: UseMutationResult<void, unknown, TagRequest>
  deleteTagAsync: UseMutationResult<void, unknown, TagRequest>
  deleteFileAsync: UseMutationResult<
    void,
    unknown,
    { task: Task; fileId: number }
  >
  uploadFileAsync: UseMutationResult<
    IFileTask,
    unknown,
    { task: Task; file: File }
  >
}

export const useTasks = (): IReturn => {
  const { taskStore, folderStore, projectStore, taskTimerStore } =
    useRootStore()

  const createAsync = useCreateMutation<
    ICreatedRecord,
    unknown,
    TaskCreateRequest
  >({
    mutationKey: ['create task'],
    mutationFn: TaskService.create
  })

  const deleteAsync = useCreateMutation<void, unknown, Task>({
    mutationKey: ['delete task'],
    mutationFn: TaskService.delete,
    onSuccess: (_, task) => {
      const isTracking = taskStore.trackingTask.id === task.id

      if (isTracking) {
        taskTimerStore.stop(task, new Date())
      }

      taskStore.delete(task)

      showToast({
        title: `Задача ${task.title} успешно удалена`,
        type: 'success'
      })

      if (task.folderId) {
        folderStore.deleteTaskFromFolder(task)
      }
    },
    onError: (_, task) => {
      showToast({
        title: `Ошибка при удалении задачи ${task.title}`,
        type: 'error'
      })
    }
  })

  const updateAsync = useCreateMutation<void, unknown, TaskUpdateFieldsRequest>(
    {
      mutationKey: ['update task'],
      mutationFn: TaskService.update,
      onSuccess: (_, variables) => {
        taskStore.update(variables)

        showToast({
          title: `Задача успешно изменена`,
          type: 'success'
        })
      },
      onError: () => {
        showToast({
          title: `Ошибка при изменении задачи`,
          type: 'error'
        })
      }
    }
  )

  const moveTaskAsync = useCreateMutation<void, unknown, MoveTaskRequest>({
    mutationKey: ['reorder task'],
    mutationFn: TaskService.move,
    onSuccess: (_, variables) => {
      taskStore.move(variables)
    }
  })

  const assignUserAsync = useCreateMutation<void, unknown, AssignUserRequest>({
    mutationKey: ['assign user task'],
    mutationFn: TaskService.assignUser,
    onSuccess: (_, variables) => {
      taskStore.assignUser(variables)
      showToast({
        title: `Исполнитель успешно изменён`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: `Ошибка при изменении исполнителя`,
        type: 'error'
      })
    }
  })

  const reassignUserAsync = useCreateMutation<
    ReassignUserResponse,
    unknown,
    Task
  >({
    mutationKey: ['reassign user task'],
    mutationFn: TaskService.reassignUser,
    onSuccess: (data, task) => {
      taskStore.reassignUser(task)

      taskTimerStore.stop(task, data.reassignedAt)

      showToast({
        title: `Исполнитель успешно удалён`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: `Ошибка при удалении исполнителя`,
        type: 'error'
      })
    }
  })

  const updateAssigner = useCreateMutation<void, unknown, AssignUserRequest>({
    mutationKey: ['update assigner'],
    mutationFn: TaskService.changeAssigner,
    onSuccess: (_, variables) => {
      taskStore.changeAssigner(variables)
    }
  })

  const assignObserverAsync = useCreateMutation<
    void,
    unknown,
    AssignObserverRequest
  >({
    mutationKey: ['assign observer task'],
    mutationFn: TaskService.assignObserver,
    onSuccess: (_, variables) => {
      taskStore.assignObserver(variables)
    }
  })

  const reassignObserverAsync = useCreateMutation<
    void,
    unknown,
    AssignObserverRequest
  >({
    mutationKey: ['reassign observer task'],
    mutationFn: TaskService.reassignObserver,
    onSuccess: (_, variables) => {
      taskStore.reassignObserver(variables)
    }
  })

  const changeProjectAsync = useCreateMutation<
    void,
    unknown,
    TaskChangeProjectRequest
  >({
    mutationKey: ['change project task'],
    mutationFn: TaskService.changeProject,
    onSuccess: (_, variables) => {
      taskStore.changeProject(variables)
      folderStore.deleteTaskFromFolder(variables.task)
    }
  })

  const changeFolderAsync = useCreateMutation<
    void,
    unknown,
    TaskChangeFolderRequest
  >({
    mutationKey: ['change folder task'],
    mutationFn: TaskService.changeFolder,
    onSuccess: (_, variables) => {
      folderStore.moveTaskToFolder(variables)
      taskStore.changeFolder(variables)

      showToast({
        title: `Задача успешно перенесена в другую папку`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({ title: `Ошибка при переносе задачи`, type: 'error' })
    }
  })

  const removeFolderAsync = useCreateMutation<void, unknown, number>({
    mutationKey: ['remove folder task'],
    mutationFn: TaskService.removeFolder,
    onSuccess: (_, variables) => {
      folderStore.moveTaskToRoot(variables)
      taskStore.removeFolder(variables)

      showToast({
        title: `Задача успешно перенесена в рутовую папку`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({ title: `Ошибка при переносе задачи`, type: 'error' })
    }
  })

  const moveTasksToNewStatus = useCreateMutation<
    MoveTasksToNewStatusResponse,
    unknown,
    MoveTasksToNewStatusRequest
  >({
    mutationKey: ['move tasks to new status'],
    mutationFn: TaskService.moveTasksToNewStatus,
    onSuccess: (data, variables) => {
      const sourceTasks = taskStore.tasks.filter(
        (task) => task.status.id === variables.sourceStatusId
      )

      const targetStatus = projectStore.getStatusById(variables.targetStatusId)

      if (targetStatus.code === TaskStatusCodeDefault.executed) {
        sourceTasks.forEach((task) =>
          taskStore.finish({ finishedAt: data.updatedAt }, task)
        )
      } else {
        sourceTasks.forEach((task) =>
          taskStore.updateStatus(task, targetStatus)
        )
      }

      showToast({
        title: 'Вы успешно переместили задачи в новый статус',
        type: 'success',
        text: `Вы переместили ${sourceTasks.length} задач`
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при перемещении задач',
        type: 'error'
      })
    }
  })

  const addTagAsync = useCreateMutation<void, unknown, TagRequest>({
    mutationKey: ['add tag'],
    mutationFn: TaskService.addTag,
    onSuccess: (_, variables) => {
      taskStore.addTag(variables.task, variables.tag)
      showToast({
        title: `Тег ${variables.tag.name} успешно добавлен к задаче ${variables.task.title}`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({ title: 'Ошибка при добавлении тега', type: 'error' })
    }
  })

  const deleteTagAsync = useCreateMutation<void, unknown, TagRequest>({
    mutationKey: ['delete tag'],
    mutationFn: ({ task, tag }) => TaskService.deleteTag(task, tag),
    onSuccess: (_, variables) => {
      taskStore.deleteTag(variables.task, variables.tag)
      showToast({
        title: `Тег ${variables.tag.name} успешно удален из задачи ${variables.task.title}`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({ title: 'Ошибка при удалении тега', type: 'error' })
    }
  })

  const uploadFileAsync = useCreateMutation<
    IFileTask,
    unknown,
    { task: Task; file: File }
  >({
    mutationKey: ['upload file'],
    mutationFn: async ({ task, file }) => {
      const formData = new FormData()
      formData.append('file', file)
      return await FileService.uploadImageTask(task, formData)
    },
    onSuccess: (uploadedFile, { task }) => {
      taskStore.addFileToTask(task, uploadedFile as FileData)
      taskStore.incrementFileCounter(task)
      showToast({
        title: 'Вы успешно добавили файл',
        type: 'success'
      })
    },
    onError: () => {
      showToast({ title: 'Ошибка при добавлении файла', type: 'error' })
    }
  })

  const deleteFileAsync = useCreateMutation<
    void,
    unknown,
    { task: Task; fileId: number }
  >({
    mutationKey: ['delete file'],
    mutationFn: ({ task, fileId }) => FileService.delete(task, fileId),
    onSuccess: (_, variables) => {
      taskStore.deleteFile(variables.task, variables.fileId)
      taskStore.decrementFileCounter(variables.task)
      showToast({
        title: 'Вы успешно удалили файл',
        type: 'success'
      })
    },
    onError: () => {
      showToast({ title: 'Ошибка при удалении файла', type: 'error' })
    }
  })

  return {
    deleteAsync,
    createAsync,
    moveTaskAsync,
    assignObserverAsync,
    reassignObserverAsync,
    updateAsync,
    assignUserAsync,
    reassignUserAsync,
    changeProjectAsync,
    updateAssigner,
    changeFolderAsync,
    removeFolderAsync,
    moveTasksToNewStatus,
    addTagAsync,
    deleteTagAsync,
    deleteFileAsync,
    uploadFileAsync
  } as IReturn
}
