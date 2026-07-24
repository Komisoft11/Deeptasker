import { QueryClient } from '@tanstack/query-core'
import { FolderStore } from '@/entities/Folder'
import { ProjectStore } from '@/entities/Project'
import { SprintStore } from '@/entities/Sprint/model/sprint.store'
import { TaskStore } from '@/entities/Task'
import { WorkspaceStore } from '@/entities/Workspace'
import { SubscribeNotificationMessageExecutor } from '@/entities/lib/components/web_socket/message_executors/SubscribeNotificationMessageExecutor'
import { SubscribeProjectMessageExecutor } from '@/entities/lib/components/web_socket/message_executors/SubscribeProjectMessageExecutor'
import { SubscribeWorkspaceMessageExecutor } from '@/entities/lib/components/web_socket/message_executors/SubscribeWorkspaceMessageExecutor'
import { IMessageExecutor } from '@/entities/lib/components/web_socket/message_executors/types/message-executor.interface'
import { isEmpty } from '@/shared/lib/helpers/main.helper'

class MessageExecutorFactory {
  private readonly workspaceStore: WorkspaceStore
  private readonly projectStore: ProjectStore
  private readonly taskStore: TaskStore
  private readonly sprintStore: SprintStore
  private readonly folderStore: FolderStore
  private readonly queryClient: QueryClient

  constructor(
    workspaceStore: WorkspaceStore,
    projectStore: ProjectStore,
    taskStore: TaskStore,
    sprintStore: SprintStore,
    folderStore: FolderStore,
    queryClient: QueryClient
  ) {
    this.workspaceStore = workspaceStore
    this.projectStore = projectStore
    this.taskStore = taskStore
    this.sprintStore = sprintStore
    this.folderStore = folderStore
    this.queryClient = queryClient
  }

  public factoryMethod(event: MessageEvent): IMessageExecutor {
    const json = JSON.parse(event.data)

    if (!isEmpty(json.project)) {
      return new SubscribeProjectMessageExecutor(
        this.projectStore,
        this.taskStore,
        this.sprintStore,
        this.folderStore,
        this.queryClient
      )
    }
    if (!isEmpty(json.workspace)) {
      return new SubscribeWorkspaceMessageExecutor(
        this.workspaceStore,
        this.projectStore,
        this.queryClient
      )
    }
    if (!isEmpty(json.notification)) {
      return new SubscribeNotificationMessageExecutor(this.queryClient)
    }

    throw new Error('not found executor message: ' + JSON.stringify(event))
  }
}

export default MessageExecutorFactory
