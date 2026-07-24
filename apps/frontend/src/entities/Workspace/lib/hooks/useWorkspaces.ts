import { useQueryClient } from '@tanstack/react-query'
import { UseMutationResult } from '@tanstack/react-query/src/types'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { WorkspaceApiError } from '@/entities/Error/workspace/workspace'
import { IUser } from '@/entities/User'
import {
  IPermissionWorkspace,
  IWorkspaceCreateDto,
  IWorkspaceInviteAdminDTO,
  IWorkspaceRemoveMemberDTO,
  IWorkspaceUpdateDto,
  Workspace
} from '@/entities/Workspace'
import { AdminInviteesDTO } from '@/entities/Workspace/model/types/workspace.interface'
import { WorkspaceService } from '@/entities/Workspace/service/workspace.service'
import { queries } from '@/entities/lib/api/all-queries'
import SubscriptionProjectEvent from '@/entities/lib/components/web_socket/events/SubscriptionProjectEvent'
import SubscriptionWorkspaceEvent from '@/entities/lib/components/web_socket/events/SubscriptionWorkspaceEvent'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { SPACE_URL } from '@/shared/config/route.config'
import { ERRORS, SUCCESS } from '@/shared/const/translation'
import { consoLER } from '@/shared/lib/helpers/log'
import { isEmpty } from '@/shared/lib/helpers/main.helper'
import { PromiseHelper } from '@/shared/lib/helpers/promise.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { MainPageNavigator } from '@/shared/lib/navigators/main.navigator'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { ICreatedRecord } from '@/shared/types/created-record.interface'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

interface ChangePermissionsParams {
  workspace: Workspace
  user: IUser
  permissions: IPermissionWorkspace
}

interface IReturn {
  createAsync: UseMutationResult<ICreatedRecord, unknown, IWorkspaceCreateDto>
  updateAsync: UseMutationResult<void, unknown, IWorkspaceUpdateDto>
  inviteAdminAsync: UseMutationResult<void, unknown, IWorkspaceInviteAdminDTO>
  cancelInviteAdminAsync: UseMutationResult<
    void,
    unknown,
    IWorkspaceInviteAdminDTO
  >
  removeMemberAsync: UseMutationResult<void, unknown, IWorkspaceRemoveMemberDTO>
  deleteAsync: UseMutationResult<void, unknown, Workspace>
  changePermissionsAsync: UseMutationResult<
    void,
    unknown,
    ChangePermissionsParams
  >
  changeWorkspace: (workspaceId: number, isChangeUrl?: boolean) => Promise<void>
}

export const useWorkspaces = (): IReturn => {
  const {
    workspaceStore,
    taskStore,
    projectStore,
    webSocketStore,
    authStore: { user },
    folderStore,
    sidebarStore,
    sprintStore
  } = useRootStore()
  const navigate = useNavigate()

  const qc = useQueryClient()

  const { t } = useTranslation([SUCCESS, ERRORS])

  const abortControllerRef = useRef<AbortController>()

  const handleWebSocketProject = async () => {
    if (isEmpty(projectStore.activeProject)) {
      webSocketStore.sendEvent(
        new SubscriptionProjectEvent(projectStore.activeProject.id)
      )
    }
  }

  const handleChangeUrl = (workspaceId: number) => {
    navigate(
      MainPageNavigator.changeNextParamAfterMatch(SPACE_URL, workspaceId + '')
    )
  }

  const changeWorkspace = async (
    workspaceId: number,
    isChangeUrl: boolean = true
  ): Promise<void> => {
    if (abortControllerRef.current) {
      consoLER('abort')
      abortControllerRef.current.abort()
    }

    const workspace = workspaceStore.get(workspaceId)

    if (workspace.id === workspaceStore.activeWorkspace.id) {
      if (projectStore.activeProject) {
        navigate(
          ProjectsNavigator.getExistProjectUrl({
            currentWorkspaceId: workspaceStore.activeWorkspace.id,
            projectSlug: projectStore.activeProject.slug
          })
        )
      } else {
        navigate(ProjectsNavigator.getProjectTemplateCreatorUrl(workspace.id))
      }
      return
    }

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current?.signal as AbortSignal

    projectStore.loading = true
    taskStore.loading = true
    sprintStore.loading = true

    taskStore.clear()
    workspaceStore.activeWorkspace = workspace
    webSocketStore.sendEvent(new SubscriptionWorkspaceEvent(workspace.id))

    if (isChangeUrl) {
      handleChangeUrl(workspaceId)
    }

    try {
      await Promise.all([
        PromiseHelper.runPromisesSequentially([
          () => workspaceStore.currentUserFetchPermissions(workspace, user),
          () => projectStore.init(),
          () => taskStore.init(signal),
          () => folderStore.init(),
          () => handleWebSocketProject(),
          () => sprintStore.init()
        ])
      ])

      if (!sidebarStore.isSecondLeftOpen) {
        sidebarStore.toggleSecondLeft('project')
      }

      const activeProject = projectStore.activeProject
      if (activeProject?.slug) {
        navigate(
          ProjectsNavigator.getExistProjectUrl({
            currentWorkspaceId: workspaceStore.activeWorkspace.id,
            projectSlug: activeProject.slug
          })
        )
      } else {
        navigate(
          MainPageNavigator.getEmptyProjectUrl(
            workspaceStore.activeWorkspace.id
          )
        )
      }
    } catch (e) {
      if (e.name === 'CanceledError') {
        return
      }
      throw e
    }
  }

  const changePermissionsAsync = useCreateMutation<
    void,
    unknown,
    ChangePermissionsParams
  >({
    mutationKey: ['change workspace permissions'],
    mutationFn: (variables) =>
      WorkspaceService.changePermissions(
        variables.workspace,
        variables.user,
        variables.permissions
      )
  })

  const createAsync = useCreateMutation<
    ICreatedRecord,
    unknown,
    IWorkspaceCreateDto
  >({
    mutationKey: ['create workspace'],
    mutationFn: WorkspaceService.create,
    onSuccess: async (data, variables) => {
      const workspace = workspaceStore.create({
        dateCreated: new Date(),
        id: data.id,
        uuid: data.uuid,
        title: variables.title
      })

      if (variables.invitees?.length) {
        qc.setQueryData<AdminInviteesDTO[]>(
          queries.workspace.invitees(workspace).queryKey,
          (emailInvitees = []) => [
            ...emailInvitees,
            ...variables.invitees!.map((invite) => ({
              email: invite.email,
              senderId: invite.senderId
            }))
          ]
        )
      }

      showToast({
        title: t('workspace.create', { ns: SUCCESS, title: variables.title }),
        type: 'success'
      })

      await changeWorkspace(workspace.id)
    },
    onError: (_, variables) => {
      showToast({
        title: t('workspace.create', { ns: ERRORS, title: variables.title }),
        type: 'error'
      })
    }
  })

  const deleteAsync = useCreateMutation<void, unknown, Workspace>({
    mutationKey: ['delete workspace'],
    mutationFn: WorkspaceService.delete,
    onSuccess: async (_, variables) => {
      const excludedWorkspaces = workspaceStore.workspaces.filter(
        (w) => w.id !== variables.id
      )

      const space = excludedWorkspaces[0]

      await changeWorkspace(space.id)

      setTimeout(() => {
        workspaceStore.delete(variables)
      }, 1200)

      showToast({
        title: t('workspace.delete', { ns: SUCCESS, title: variables.title }),
        type: 'success'
      })
    },
    onError: (_, variables) => {
      showToast({
        title: t('workspace.delete', { ns: ERRORS, title: variables.title }),
        type: 'error'
      })
    }
  })

  const updateAsync = useCreateMutation<void, unknown, IWorkspaceUpdateDto>({
    mutationKey: ['update workspace'],
    mutationFn: WorkspaceService.update,
    onSuccess: (_, variables) => {
      workspaceStore.update(variables)

      showToast({
        title: t('workspace.update', { ns: SUCCESS, title: variables.title }),
        type: 'success'
      })
    },
    onError: (_, variables) => {
      showToast({
        title: t('workspace.update', { ns: ERRORS, title: variables.title }),
        type: 'error'
      })
    }
  })

  const inviteAdminAsync = useCreateMutation<
    void,
    unknown,
    IWorkspaceInviteAdminDTO
  >({
    mutationKey: ['invite member workspace'],
    mutationFn: WorkspaceService.inviteAdmin,
    onSuccess: (_, { email, workspace, senderId }) => {
      qc.setQueryData<AdminInviteesDTO[]>(
        queries.workspace.invitees(workspace).queryKey,
        (invite = []) => [...invite, { email, senderId }]
      )
      showToast({
        title: 'Приглашение отправлено',
        type: 'success',
        text: `Вы отправили приглашение в рабочее пространство ${workspace.title} на почту ${email}`
      })
    },
    onError: (e, { email, workspace }) => {
      let text = 'Приглашение не отправлено'
      const error = new WorkspaceApiError(e)

      if (error.isAlreadyAdmin()) {
        text = `Пользователь c почтой ${email} уже админ рабочего пространства ${workspace.title}`
      } else if (error.isAlreadyInvited()) {
        text = `Вы уже отправили приглашение на почту ${email}`
      }

      showToast({
        title: 'Приглашение не отправлено',
        type: 'error',
        text: text
      })
    }
  })

  const cancelInviteAdminAsync = useCreateMutation<
    void,
    unknown,
    IWorkspaceInviteAdminDTO
  >({
    mutationKey: ['cancel member workspace'],
    mutationFn: WorkspaceService.cancelAdmin,
    onSuccess: (_, { email, workspace }) => {
      qc.setQueryData<AdminInviteesDTO[]>(
        queries.workspace.invitees(workspace).queryKey,
        (emails = []) => emails.filter((invite) => invite.email !== email)
      )
      showToast({
        title: 'Приглашение отменено',
        type: 'success',
        text: `Вы отменили приглашение для ${email} в рабочее пространство ${workspace.title}`
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

  const removeMemberAsync = useCreateMutation<
    void,
    unknown,
    IWorkspaceRemoveMemberDTO
  >({
    mutationKey: ['remove member workspace'],
    mutationFn: WorkspaceService.removeMember,
    onSuccess: (_, variables) => {
      const { memberId: admin, workspace: p } = variables

      qc.setQueryData<IUser[]>(
        queries.workspace.admin(p).queryKey,
        (oldUsers) => oldUsers?.filter((user) => user.id !== admin) ?? []
      )

      qc.setQueryData<IUser[]>(
        queries.workspace.invitees(p).queryKey,
        (oldUsers) => oldUsers?.filter((user) => user.id !== admin) ?? []
      )
    }
  })

  return {
    createAsync,
    updateAsync,
    inviteAdminAsync,
    cancelInviteAdminAsync,
    removeMemberAsync,
    deleteAsync,
    changePermissionsAsync,
    changeWorkspace
  } as IReturn
}
