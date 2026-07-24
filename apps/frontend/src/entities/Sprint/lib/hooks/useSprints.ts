import { UseMutationResult } from '@tanstack/react-query/src/types'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  ISprintCreateDTO,
  ISprintRecord,
  ISprintUpdateDTO,
  SprintStatuses
} from '@/entities/Sprint/model/types/sprint.types'
import { SprintsService } from '@/entities/Sprint/services/sprint.service'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { SprintsNavigator } from '@/shared/lib/navigators/sprints.navigator'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

interface IReturn {
  createAsync: UseMutationResult<ISprintRecord, unknown, ISprintCreateDTO>
  deleteAsync: UseMutationResult<void, unknown, { id: number }>
  updateAsync: UseMutationResult<
    void,
    unknown,
    { id: number; updates: ISprintUpdateDTO }
  >
  removeTaskAsync: UseMutationResult<
    void,
    unknown,
    { id: number; taskIds: number[] }
  >
  addTasksAsync: UseMutationResult<
    void,
    unknown,
    { id: number; taskIds: number[] }
  >
}

export const useSprints = (): IReturn => {
  const {
    workspaceStore: { activeWorkspace },
    sprintStore,
    projectStore: { activeProject },
    taskStore
  } = useRootStore()
  const navigate = useNavigate()
  const { t } = useTranslation(ENTITY)

  const createAsync = useCreateMutation<
    { id: number; status: SprintStatuses },
    unknown,
    ISprintCreateDTO
  >({
    mutationKey: ['create sprint'],
    mutationFn: SprintsService.addSprint,
    onSuccess: (data, variables) => {
      sprintStore.create(data.id, data.status, variables)
      showToast({
        title: `Спринт ${variables.title} успешно создан`,
        type: 'success',
        text: `Статус спринта - ${t(`sprints.statuses.${data.status}`)}`
      })
    },
    onError: (_, variables) => {
      showToast({
        title: `При создании спринта ${variables.title} произошла ошибка`,
        type: 'error'
      })
    }
  })

  const deleteAsync = useCreateMutation<void, unknown, { id: number }>({
    mutationKey: ['delete sprint'],
    mutationFn: SprintsService.deleteSprint,
    onSuccess: (_, variables) => {
      sprintStore.deleteSprint(variables.id)
      navigate(
        SprintsNavigator.getSprintsUrl({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: activeProject.slug
        })
      )
      showToast({
        title: `Спринт  успешно удалён`,
        type: 'success',
        text: 'Ваши задачи не удалились, у них просто больше нет спринта'
      })
    },
    onError: () => {
      showToast({
        title: `При удалении спринта произошла ошибка`,
        type: 'error'
      })
    }
  })

  const updateAsync = useCreateMutation<
    void,
    unknown,
    { id: number; updates: ISprintUpdateDTO }
  >({
    mutationKey: ['update sprint'],
    mutationFn: SprintsService.updateSprint,
    onSuccess: (_, variables) => {
      sprintStore.updateSprint(variables.id, variables.updates)
      showToast({
        title: `Спринт  успешно обновлён`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: `При изменении спринта произошла ошибка`,
        type: 'error'
      })
    }
  })

  const removeTaskAsync = useCreateMutation<
    void,
    unknown,
    { id: number; taskIds: number[] }
  >({
    mutationKey: ['remove task from sprint'],
    mutationFn: SprintsService.removeTaskFromSprint,
    onSuccess: (_, variables) => {
      sprintStore.removeTasksFromSprint(variables.id, variables.taskIds)
      variables.taskIds.forEach((taskId) => {
        taskStore.removeSprint(taskId)
      })
      showToast({
        title: `Вы успешно убрали задачи из спринта (${variables.taskIds.length})`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: `При удалении задач из спринта произошла ошибка`,
        type: 'error'
      })
    }
  })

  const addTasksAsync = useCreateMutation<
    void,
    unknown,
    { id: number; taskIds: number[] }
  >({
    mutationKey: ['add tasks to sprint'],
    mutationFn: SprintsService.addTasksToSprint,
    onSuccess: (_, variables) => {
      sprintStore.addTasksToSprint(variables.id, variables.taskIds)
      variables.taskIds.forEach((taskId) => {
        taskStore.addSprint(taskId, variables.id)
      })
      showToast({
        title: `Вы успешно добавили задачи в спринт (${variables.taskIds.length})`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: `При добавлении задач в спринт произошла ошибка`,
        type: 'error'
      })
    }
  })

  return {
    createAsync,
    deleteAsync,
    updateAsync,
    removeTaskAsync,
    addTasksAsync
  }
}
