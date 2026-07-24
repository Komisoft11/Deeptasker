import { ParseIntPipe } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, WebSocket } from 'ws'
import { EventService } from '../events/event.service'
import { IncomingMessage } from 'http'
import { ProjectService } from './project.service'

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL
  }
})
export class ProjectGateway implements OnGatewayConnection<WebSocket>, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly eventService: EventService,
    private readonly projectService: ProjectService
  ) {}

  async handleConnection(clientSocket: WebSocket, message: IncomingMessage) {
    return this.eventService.handleConnection(clientSocket, message)
  }

  async handleDisconnect(clientSocket: WebSocket) {
    return this.eventService.handleDisconnect(clientSocket)
  }

  @SubscribeMessage('subscribe-project')
  async subscribeProject(
    @MessageBody('id', ParseIntPipe) projectId: number,
    @ConnectedSocket() client: WebSocket
  ) {
    await this.projectService.subscribe(client, projectId)
  }
}
