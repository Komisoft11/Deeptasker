import { IEvent } from '@/entities/lib/components/web_socket/types/web-socket.interface'
import { SUBSCRIBE_PROJECT_EVENT } from '@/shared/const/webSocket'

class SubscriptionProjectEvent implements IEvent {
  public projectId: number | undefined

  constructor(projectId: number | undefined = undefined) {
    this.projectId = projectId
  }

  getData(): string {
    const eventData = {
      event: SUBSCRIBE_PROJECT_EVENT,
      data: {
        id: this.projectId
      }
    }

    return JSON.stringify(eventData)
  }
}

export default SubscriptionProjectEvent
