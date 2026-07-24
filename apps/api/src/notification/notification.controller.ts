import { Auth } from '../auth/decorators/auth.decorator'
import { GlobalRole } from '../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query
} from '@nestjs/common'
import { User } from '../auth/decorators/user.decorator'
import { UserModel } from '../user/models/user.model'
import { NotificationMessage } from './types'
import { NotificationService } from './notification.service'

@Auth(GlobalRole.User)
@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly messagingService: NotificationService) {}

  @Get()
  async getUserNotification(
    @User() user: UserModel,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number
  ): Promise<NotificationMessage[]> {
    return this.messagingService.getUserNotifications({ userId: user.id, limit, offset })
  }

  @Get('count-unread')
  async getUserNotificationUnreadCount(@User() user: UserModel): Promise<number> {
    return this.messagingService.getUnreadNotificationsCount({ userId: user.id })
  }

  @HttpCode(HttpStatus.OK)
  @Post('read/all')
  async markReadAll(@User() user: UserModel) {
    return this.messagingService.markReadAll({ userId: user.id })
  }

  @HttpCode(HttpStatus.OK)
  @Post('read/:uuid')
  async markRead(@Param('uuid', ParseUUIDPipe) uuid: string, @User() user: UserModel) {
    return this.messagingService.markRead({ uuid, userId: user.id })
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete/:uuid')
  async delete(@Param('uuid', ParseUUIDPipe) uuid: string, @User() user: UserModel) {
    return this.messagingService.deleteNotification({ userId: user.id, uuid })
  }

  @HttpCode(HttpStatus.OK)
  @Post('undelete/:uuid')
  async undelete(@Param('uuid', ParseUUIDPipe) uuid: string, @User() user: UserModel) {
    return this.messagingService.undeleteNotification({ uuid, userId: user.id })
  }

  @HttpCode(HttpStatus.OK)
  @Delete('delete-all')
  async deleteAll(@User() user: UserModel): Promise<void> {
    return this.messagingService.deleteAllNotifications({ userId: user.id })
  }
}
