import { QueryClient } from '@tanstack/query-core'
import { makeAutoObservable } from 'mobx'
import { FolderStore } from '@/entities/Folder'
import { ProjectStore } from '@/entities/Project'
import { SprintStore } from '@/entities/Sprint/model/sprint.store'
import { TaskStore } from '@/entities/Task'
import { WorkspaceStore } from '@/entities/Workspace'
import MessageExecutorFactory from '@/entities/lib/components/web_socket/message_executors/MessageExecutorFactory'
import { IEvent } from '@/entities/lib/components/web_socket/types/web-socket.interface'

class WebSocketStore {
  private _isConnected: boolean = false
  private _socket: WebSocket | undefined
  private messageExecutorFactory: MessageExecutorFactory
  private isEnable = true

  constructor(
    workspaceStore: WorkspaceStore,
    projectStore: ProjectStore,
    taskStore: TaskStore,
    sprintStore: SprintStore,
    folderStore: FolderStore,
    queryClient: QueryClient
  ) {
    this.isEnable = import.meta.env.VITE_APP_ENABLE_WEBSOCKET === '1'
    makeAutoObservable(this)
    this.messageExecutorFactory = new MessageExecutorFactory(
      workspaceStore,
      projectStore,
      taskStore,
      sprintStore,
      folderStore,
      queryClient
    )
  }

  get socket(): WebSocket | undefined {
    return this._socket
  }

  get isConnected(): boolean {
    return this._isConnected
  }

  public connect() {
    if (!this.isEnable) {
      return
    }

    if (!this.isConnected) {
      this._socket = new WebSocket(import.meta.env.VITE_WS)

      this._socket.onopen = () => {
        console.log('Web socket is onopen')
        this._isConnected = true
      }

      this._socket.onclose = () => {
        console.log('Web socket is closed')
        this._isConnected = false
        this._socket = undefined
      }

      this._socket.onmessage = (ev) => {
        console.log('%c[WS RAW EVENT]', 'color: cyan', ev.data)
        const messageExecutor = this.messageExecutorFactory.factoryMethod(ev)
        messageExecutor.execute(ev)
      }
    }
  }

  public sendEvent(event: IEvent) {
    if (!this.isEnable) {
      return
    }

    if (this._socket === undefined) {
      console.error('Web socket is not connected, trying again...')

      this.connect()

      setTimeout(() => {
        this.sendEvent(event)
      }, 5000)

      return
    }

    const socket = this.socket as WebSocket
    console.log('Sending via WS', event)
    socket.send(event.getData())
  }

  public disconnect() {
    if (!this.isEnable) {
      return
    }

    if (this._socket !== undefined) {
      this._socket.close()
    }
  }
}

export default WebSocketStore
