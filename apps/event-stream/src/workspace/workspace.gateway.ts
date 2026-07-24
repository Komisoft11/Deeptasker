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
import { IncomingMessage } from 'http'
import { ParseIntPipe } from '@nestjs/common'
import { WorkspaceService } from './workspace.service'
import { EventService } from '../events/event.service'

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL
  }
})
export class WorkspaceGateway implements OnGatewayConnection<WebSocket>, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly eventService: EventService,
    private readonly workspaceService: WorkspaceService
  ) {}

  async handleConnection(clientSocket: WebSocket, message: IncomingMessage) {
    return this.eventService.handleConnection(clientSocket, message)
  }

  async handleDisconnect(clientSocket: WebSocket) {
    return this.eventService.handleDisconnect(clientSocket)
  }

  @SubscribeMessage('subscribe-workspace')
  async subscribeWorkspace(
    @MessageBody('id', ParseIntPipe) projectId: number,
    @ConnectedSocket() client: WebSocket
  ) {
    await this.workspaceService.subscribe(client, projectId)
  }
}
