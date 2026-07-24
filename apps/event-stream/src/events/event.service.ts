import { Injectable } from '@nestjs/common'
import { ResourceSubscriber } from './components/resource-subscriber'
import { WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { TokenExpiredError } from 'jsonwebtoken'
import { JwtWsStrategy } from '../auth/strategies/jwt-ws.strategy'
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface'
import type { EventStreamDto } from '@komisoft/deeptasker-event-stream-types'

@Injectable()
export class EventService {
  private clients: Map<number, WebSocket> = new Map<number, WebSocket>()
  private sockets: Map<WebSocket, number> = new Map<WebSocket, number>()

  private resourceSubscribers: ResourceSubscriber[] = []

  constructor(private readonly authStrategy: JwtWsStrategy) {}

  public async handleConnection(clientSocket: WebSocket, message: IncomingMessage) {
    try {
      const payload = await this.getUser(message)

      this.addClient(payload, clientSocket)

      console.log('[+] Success connected user ' + payload.id + ' ' + payload.username)
    } catch (e) {
      let message = undefined
      if (e instanceof TokenExpiredError) {
        message = 'Token expired'
      }
      console.error(e)
      clientSocket.close(1008, message)
    }
  }

  public async handleDisconnect(clientSocket: WebSocket) {
    this.removeClient(clientSocket)
  }

  public addClient(user: IJwtPayload, clientSocket: WebSocket) {
    this.clients.set(user.id, clientSocket)
    this.sockets.set(clientSocket, user.id)
  }

  public removeClient(clientSocket: WebSocket) {
    const userId = this.sockets.get(clientSocket)
    if (!userId) {
      return
    }

    this.sockets.delete(clientSocket)
    this.clients.delete(userId)

    this.resourceSubscribers.forEach(subscriber => {
      subscriber.unsubscribeFromCurrent(userId)
    })
  }

  public addResourceSubscriber(resourceSubscriber: ResourceSubscriber) {
    this.resourceSubscribers.push(resourceSubscriber)
  }

  public async subscribe(
    clientSocket: WebSocket,
    resourceSubscriber: ResourceSubscriber,
    resourceId: number
  ) {
    const userId = this.sockets.get(clientSocket)
    resourceSubscriber.subscribe(userId, resourceId)
  }

  public send(subscribers: number[], event: EventStreamDto) {
    console.log('subscribers: ', subscribers)

    if (!subscribers.length) {
      return
    }

    const isSendingToOriginUser = event?.isOrigin

    for (const userId of subscribers) {
      if (userId === event.userId && !isSendingToOriginUser) {
        // avoid sending to event sender
        console.log('Not sending to origin user: ' + userId)
        continue
      }

      const socket = this.clients.get(userId)

      if (socket) {
        socket.send(JSON.stringify(event))
      }
    }
  }

  private async getUser(message: IncomingMessage): Promise<IJwtPayload> {
    return this.authStrategy.getPayloadFromIncomingMessage(message)
  }
}
