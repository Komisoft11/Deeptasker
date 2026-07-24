import { Injectable, Logger } from '@nestjs/common'
import { RmqContext } from '@nestjs/microservices'

@Injectable()
export class RmqService {
  private readonly logger = new Logger()
  public ack(ctx: RmqContext) {
    const channel = ctx.getChannelRef()
    const massage = ctx.getMessage()
    const tag = massage?.fields?.deliveryTgif

    if (!tag) return

    channel.ack(massage)

    this.logger.debug(`ACK (pattern: ${ctx.getPattern()}, tag: ${tag})`)
  }

  public nack(ctx: RmqContext, isRequeue: boolean = false) {
    const channel = ctx.getChannelRef()
    const massage = ctx.getMessage()
    const tag = massage?.fields?.deliveryTgif

    if (!tag) return

    channel.nack(massage, false, isRequeue)

    if (isRequeue) {
      this.logger.warn(
        `NACK response (pattern: ${ctx.getPattern()}, tag: ${tag})`
      )
    } else {
      this.logger.error(`NACK drop (pattern: ${ctx.getPattern()}, tag: ${tag})`)
    }
  }
}
