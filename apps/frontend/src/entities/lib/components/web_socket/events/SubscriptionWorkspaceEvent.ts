import { IEvent } from '@/entities/lib/components/web_socket/types/web-socket.interface'
import { SUBSCRIBE_WORKSPACE_EVENT } from '@/shared/const/webSocket'

class SubscriptionWorkspaceEvent implements IEvent {
  public workspaceId: number | undefined

  constructor(workspaceId: number | undefined = undefined) {
    this.workspaceId = workspaceId
  }

  getData(): string {
    const eventData = {
      event: SUBSCRIBE_WORKSPACE_EVENT,
      data: {
        id: this.workspaceId
      }
    }

    return JSON.stringify(eventData)
  }
}

export default SubscriptionWorkspaceEvent
