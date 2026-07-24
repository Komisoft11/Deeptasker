import type { EventStreamDto } from '@komisoft/deeptasker-event-stream-types'

export interface ISenderService {
  send(event: EventStreamDto): void
}
