import { useQueryClient } from '@tanstack/react-query'
import { UseMutationResult } from '@tanstack/react-query/src/types'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { Id } from 'react-toastify/dist/types'
import useProjectItem from '@/features/Project/ProjectItem/hooks/useProjectItem'
import { ProjectApiError } from '@/entities/Error'
import {
  ICreateDuplicateStatusDTO,
  ICreateProjectDTO,
  IProjectDto,
  IProjectUpdateDto,
  ITag,
  ITagCreateDto,
  ITaskStatus,
  ITaskStatusCreateDto,
  ITaskStatusUpdateDto,
  Project
} from '@/entities/Project'
import {
  IDeleteTaskStatusDto,
  IDuplicateStatusDTO,
  IProjectInviteMemberOrCancelInvite,
  IProjectInviteMultipleMembers,
  IProjectInviteesDTO,
  IProjectPermissionRole,
  IProjectRemoveMember
} from '@/entities/Project/model/types/project.interface'
import { ProjectService } from '@/entities/Project/services/project.service'
import { IUser } from '@/entities/User'
import { queries } from '@/entities/lib/api/all-queries'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { ERRORS, SUCCESS } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { MainPageNavigator } from '@/shared/lib/navigators/main.navigator'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

interface IReturn {
  createAsync: UseMutationResult<IProjectDto, unknown, ICreateProjectDTO>
  createTagAsync: UseMutationResult<ITag, unknown, ITagCreateDto>
  updateAsync: UseMutationResult<
    void,
    unknown,
    { workspaceId: number; dto: Partial<IProjectUpdateDto> }
  >
  inviteMemberAsync: UseMutationResult<
    void,
    unknown,
    IProjectInviteMemberOrCancelInvite
  >
  cancelInviteMemberAsync: UseMutationResult<
    void,
    unknown,
    IProjectInviteMemberOrCancelInvite
  >
  inviteMultipleMembersAsync: UseMutationResult<
    void,
    unknown,
    IProjectInviteMultipleMembers
  >
  removeMemberAsync: UseMutationResult<void, unknown, IProjectRemoveMember>
  deleteAsync: UseMutationResult<void, unknown, Project>
  changePermissionsAsync: UseMutationResult<
    void,
    unknown,
    [IUser, Project, IProjectPermissionRole]
  >
  createTaskStatusAsync: UseMutationResult<
    ITaskStatus,
    unknown,
    [Project, ITaskStatusCreateDto]
  >
  deleteTaskStatusAsync: UseMutationResult<void, unknown, IDeleteTaskStatusDto>
  duplicateStatusAsync: UseMutationResult<
    IDuplicateStatusDTO,
    unknown,
    ICreateDuplicateStatusDTO
  >
  updateTaskStatusAsync: UseMutationResult<
    ITaskStatus,
    unknown,
    [Project, ITaskStatusUpdateDto]
  >
  deleteTagAsync: UseMutationResult<
    void,
    unknown,
    { projectId: number; tagId: number }
  >
  changeTagAsync: UseMutationResult<
    void,
    unknown,
    { projectId: number; tagId: number; dto: ITag }
  >
  getFullProjectAsync: UseMutationResult<
    IProjectDto,
    unknown,
    { projectId: number }
  >
  isSlugExists: (slug: string) => boolean
  isTitleExists: (title: string) => boolean
  isTagTitleExist: (title: string) => boolean
}

export const useProjects = (): IReturn => {
  const {
    projectStore,
    dialogStore: { deleteDialog },
    workspaceStore,
    taskStore
  } = useRootStore()

  const ql = useQueryClient()

  const { handleChangeProject } = useProjectItem()

  const navigate = useNavigate()

  const { t } = useTranslation([SUCCESS, ERRORS])

  const createAsync = useCreateMutation<
    IProjectDto,
    unknown,
    ICreateProjectDTO
  >({
    mutationFn: ProjectService.create,
    onSuccess: async (dto, variables) => {
      const project = await projectStore.create(dto)

      await handleChangeProject(project)
      workspaceStore.activeWorkspace.projectCount += 1

      if (variables.invitees.length > 0) {
        ql.setQueryData<IProjectInviteesDTO[]>(
          queries.project.invitees(project, workspaceStore.activeWorkspace.id)
            .queryKey,
          (prev = []) => {
            const existingEmails = new Set(prev.map((invite) => invite.email))

            const newInvitees = variables.invitees
              .filter((invitee) => !existingEmails.has(invitee.email))
              .map((invitee) => ({
                email: invitee.email,
                role: invitee.role,
                senderId: invitee.senderId
              }))

            return [...prev, ...newInvitees]
          }
        )
      }

      showToast({
        title: t('project.create', { title: variables.title, ns: SUCCESS }),
        type: 'success'
      })
    },
    onError: (_, variables) => {
      showToast({
        title: t('project.create', { title: variables.title, ns: ERRORS }),
        type: 'error'
      })
    }
  })

  const deleteAsync = useCreateMutation<void, unknown, Project>({
    mutationFn: (project) => {
      deleteDialog.loading = true
      return ProjectService.delete(project)
    },
    onSuccess: async (_, variables) => {
      const excludedProjects = projectStore.projects.filter(
        (p) => p.id !== variables.id
      )

      if (excludedProjects.length > 0) {
        await handleChangeProject(excludedProjects[0])
        projectStore.delete(variables)
      } else {
        projectStore.activeProject = {} as Project
        navigate(
          MainPageNavigator.getEmptyProjectUrl(
            workspaceStore.activeWorkspace.id
          )
        )
        projectStore.projects = []
        setTimeout(() => {
          projectStore.delete(variables)
        }, 1200)
      }

      showToast({
        title: t('project.delete', { title: variables.title, ns: SUCCESS }),
        type: 'success'
      })

      deleteDialog.clear()
    },
    onError: (_, variables) => {
      showToast({
        title: t('project.delete', { title: variables.title, ns: ERRORS }),
        type: 'success'
      })
      deleteDialog.clear()
    }
  })

  const updateAsync = useCreateMutation<
    void,
    unknown,
    { workspaceId: number; dto: Partial<IProjectUpdateDto> }
  >({
    mutationFn: ({ workspaceId, dto }) =>
      ProjectService.update(workspaceId, dto),
    onSuccess: (_, variables) => {
      projectStore.update(variables.dto)
      showToast({
        title: t('project.update', { title: variables.dto.title, ns: SUCCESS }),
        type: 'success'
      })
    },
    onError: (_, variables) => {
      showToast({
        title: t('project.update', { title: variables.dto.title, ns: ERRORS }),
        type: 'error'
      })
    }
  })

  const createTagAsync = useCreateMutation<ITag, unknown, ITagCreateDto>({
    mutationFn: ProjectService.createTag,
    onSuccess: (data, variables) => {
      projectStore.createTag(data, variables)

      showToast({
        title: `Тег ${variables.name} успешно создан`,
        type: 'success'
      })
    },
    onError: (_, variables) => {
      showToast({
        title: `Ошибка при создании тега ${variables.name}`,
        type: 'error'
      })
    }
  })

  const deleteTagAsync = useCreateMutation<
    void,
    unknown,
    { projectId: number; tagId: number }
  >({
    mutationFn: ({ projectId, tagId }) =>
      ProjectService.deleteTag(projectId, tagId),
    onSuccess: (_, variables) => {
      projectStore.deleteTag(variables.projectId, variables.tagId)
      showToast({
        title: `Тег успешно удалён`,
        type: 'success'
      })
    },
    onError: (_, variables) => {
      showToast({
        title: `Ошибка при удалении тега ID ${variables.tagId}`,
        type: 'error'
      })
    }
  })

  const changeTagAsync = useCreateMutation<
    void,
    unknown,
    { projectId: number; tagId: number; dto: ITag }
  >({
    mutationFn: async ({ projectId, tagId, dto }) => {
      await ProjectService.changeTag(projectId, tagId, dto)
    },
    onSuccess: (_, { tagId, dto }) => {
      projectStore.changeTag(projectStore.activeProject, tagId, dto)
      showToast({
        title: `Тег "${dto.name}" успешно обновлён`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при изменении тега',
        type: 'error'
      })
    }
  })

  const createTaskStatusAsync = useCreateMutation<
    ITaskStatus,
    unknown,
    [Project, ITaskStatusCreateDto]
  >({
    mutationKey: ['create task status'],
    mutationFn: (variables) => ProjectService.createTaskStatus(...variables),
    onSuccess: (data) => {
      projectStore.createTaskStatus(data)
      showToast({
        title: `Статус ${data.name} успешно создан`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: `Ошибка при создании статуса`,
        type: 'error'
      })
    }
  })

  const updateTaskStatusAsync = useCreateMutation<
    ITaskStatus,
    unknown,
    [Project, ITaskStatusUpdateDto]
  >({
    mutationKey: ['update status'],
    mutationFn: (variables) => ProjectService.updateTaskStatus(...variables),
    onSuccess: (data, variables) => {
      const [_, dto] = variables
      projectStore.updateTaskStatus(dto)
      showToast({
        title: `Статус ${data.name} успешно обновлен`,
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: `Ошибка при обновлении статуса`,
        type: 'error'
      })
    }
  })

  const deleteTaskStatusAsync = useCreateMutation<
    void,
    unknown,
    IDeleteTaskStatusDto & { toastId?: Id }
  >({
    mutationKey: ['delete task status'],
    mutationFn: ProjectService.deleteTaskStatus,
    onSuccess: async (_, variables) => {
      if (variables.toastId) toast.dismiss(variables.toastId)

      projectStore.deleteTaskStatus(variables.status)
      const tasksToDelete = taskStore.tasks.filter(
        (task) => task.status.id === variables.status.id
      )

      projectStore.activeProject.taskCount -= tasksToDelete.length
      showToast({
        title: `Статус ${variables.status.name} успешно удален`,
        type: 'success'
      })
    },
    onError: (_, variables) => {
      if (variables?.toastId) toast.dismiss(variables.toastId)
      showToast({
        title: `Ошибка при удалении статуса ${variables.status.name}`,
        type: 'error'
      })
    }
  })

  const inviteMemberAsync = useCreateMutation<
    void,
    unknown,
    IProjectInviteMemberOrCancelInvite
  >({
    mutationKey: ['invite member'],
    mutationFn: ProjectService.inviteMember,
    onSuccess: (_, { email, project, senderId }) => {
      ql.setQueryData<IProjectInviteesDTO[]>(
        queries.project.invitees(project, project.workspace.id).queryKey,
        (emails = []) => [...emails, { email: email, senderId: senderId }]
      )

      showToast({
        title: 'Приглашение отправлено',
        type: 'success',
        text: `Вы отправили приглашение в проект ${project.title} на почту ${email}`
      })
    },
    onError: (e, { email, project }) => {
      const error = new ProjectApiError(e)

      let text = `Произошла ошибка при отправлении приглашения на почту ${email}`

      if (error.isAlreadyInvited()) {
        text = `Вы уже отправили приглашение на почту ${email}. Пользователь пока не принял/отклонил его`
      } else if (error.isAlreadyMember()) {
        text = `Пользователь c почтой ${email} уже участник проекта ${project.title}`
      }

      showToast({
        title: 'Приглашение не отправлено',
        type: 'error',
        text: text
      })
    }
  })

  const cancelInviteMemberAsync = useCreateMutation<
    void,
    unknown,
    IProjectInviteMemberOrCancelInvite
  >({
    mutationKey: ['cancel invite member'],
    mutationFn: ProjectService.cancelInviteMember,
    onSuccess: (_, { project, email }) => {
      ql.setQueryData<IProjectInviteesDTO[]>(
        queries.project.invitees(project, project.workspace.id).queryKey,
        (emails = []) => emails.filter((invite) => invite.email !== email)
      )

      showToast({
        title: 'Приглашение отменено',
        type: 'success',
        text: `Вы отменили приглашение для ${email} в проект ${project.title}`
      })
    },
    onError: (_, { email }) => {
      showToast({
        title: 'Приглашение не отменено',
        type: 'error',
        text: `Произошла ошибка при отмене приглашения. Приглашение все еще действительно для ${email}`
      })
    }
  })

  const inviteMultipleMembersAsync = useCreateMutation<
    void,
    unknown,
    IProjectInviteMultipleMembers
  >({
    mutationKey: ['invite multiple members'],
    mutationFn: ProjectService.inviteMultipleMembers,
    onSuccess: (_, variables) => {
      variables.invitees.forEach(({ email }) => {
        ql.setQueryData<IProjectInviteesDTO[]>(
          queries.project.invitees(
            variables.project,
            variables.project.workspace.id
          ).queryKey,
          (emails = []) => emails.filter((invite) => invite.email !== email)
        )
      })
      showToast({
        title: 'Успешное добавление пользователей',
        type: 'success',
        text: `Вы успешно добавили ${variables.invitees.length} пользователей в проект ${variables.project.title}`
      })
    },
    onError: (_, variables) => {
      showToast({
        title: 'Ошибка при добавлении пользователей',
        type: 'error',
        text: `Произошла ошибка при добавлении ${variables.invitees.length} пользователей в проект ${variables.project.title}`
      })
    }
  })

  const removeMemberAsync = useCreateMutation<
    void,
    unknown,
    IProjectRemoveMember
  >({
    mutationKey: ['remove member project'],
    mutationFn: ProjectService.removeMember,
    onSuccess: (_, { project, member }) => {
      ql.setQueryData<IUser[]>(
        queries.project.members(project, project.workspace.id).queryKey,
        (old) => (old ? old.filter((u) => u.id !== member.id) : [])
      )

      showToast({
        title: 'Пользователь исключен',
        type: 'success',
        text: `Вы исключили пользователя ${member.firstName} ${member.lastName} из проекта ${project.title}`
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при исключении пользователя',
        type: 'error'
      })
    }
  })

  const changePermissionsAsync = useCreateMutation<
    void,
    unknown,
    [IUser, Project, IProjectPermissionRole]
  >({
    mutationFn: (variables) => ProjectService.changePermissions(...variables),
    onSuccess: () => {
      showToast({ title: 'Успешное изменение роли', type: 'success' })
    }
  })

  const getFullProjectAsync = useCreateMutation<
    IProjectDto,
    unknown,
    { projectId: number }
  >({
    mutationKey: ['get full project'],
    mutationFn: ({ projectId }) => {
      const workspaceId = workspaceStore.activeWorkspace.id

      return ProjectService.getProject(projectId, workspaceId)
    },
    onSuccess: (data) => {
      projectStore.update(data)
    }
  })

  const isSlugExists = (slug: string) => {
    return projectStore.projects.some((project) => project.slug === slug)
  }

  const isTitleExists = (title: string) => {
    return projectStore.projects.some((project) => project.title === title)
  }

  const isTagTitleExist = (title: string): boolean => {
    return projectStore.activeProject.tags.some(
      (exisingTag) => exisingTag.name.toLowerCase() === title.toLowerCase()
    )
  }

  const duplicateStatusAsync = useCreateMutation<
    IDuplicateStatusDTO,
    unknown,
    ICreateDuplicateStatusDTO
  >({
    mutationKey: ['duplicate status'],
    mutationFn: ProjectService.duplicateStatus
  })

  return {
    createAsync,
    createTagAsync,
    updateAsync,
    inviteMemberAsync,
    cancelInviteMemberAsync,
    inviteMultipleMembersAsync,
    removeMemberAsync,
    deleteAsync,
    changePermissionsAsync,
    createTaskStatusAsync,
    deleteTaskStatusAsync,
    updateTaskStatusAsync,
    getFullProjectAsync,
    changeTagAsync,
    deleteTagAsync,
    isTagTitleExist,
    isSlugExists,
    isTitleExists,
    duplicateStatusAsync
  }
}

export default useProjects
