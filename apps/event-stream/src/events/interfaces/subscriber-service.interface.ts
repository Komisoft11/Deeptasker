import { WebSocket } from 'ws'

export interface ISubscriberService {
  subscribe(clientSocket: WebSocket, workspaceId: number): void
}
