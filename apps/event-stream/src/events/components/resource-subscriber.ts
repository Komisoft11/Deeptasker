export class ResourceSubscriber {
  // map resourceId->userId[]
  private resourceSubscribers: Map<number, number[]> = new Map<number, number[]>()
  // map userId->resourceId . Subscriber can only subscribe to one resource at a time
  private subscriberResource: Map<number, number> = new Map<number, number>()

  public subscribe(userId: number, resourceId: number) {
    // TODO: check if userId and resourceId exists

    this.unsubscribeFromCurrent(userId)
    this.subscriberResource.set(userId, resourceId)

    let subscribedUsers = this.resourceSubscribers.get(resourceId)
    if (!subscribedUsers) {
      subscribedUsers = []
      this.resourceSubscribers.set(resourceId, subscribedUsers)
    }

    subscribedUsers.push(userId)

    console.log(
      'resource ' + resourceId + ' subscribers: ' + this.resourceSubscribers.get(resourceId)
    )
  }

  public unsubscribeFromCurrent(userId: number) {
    const resourceId: number = this.subscriberResource.get(userId)
    if (!resourceId) {
      return
    }

    this.subscriberResource.delete(userId)

    const subscribers = this.resourceSubscribers.get(resourceId)
    if (!subscribers) {
      return
    }

    for (let i = 0; i < subscribers.length; i++) {
      if (subscribers[i] === userId) {
        subscribers.splice(i, 1)
        break
      }
    }
  }

  public getSubscribers(resourceId: number): number[] {
    return this.resourceSubscribers.get(resourceId) || []
  }
}
