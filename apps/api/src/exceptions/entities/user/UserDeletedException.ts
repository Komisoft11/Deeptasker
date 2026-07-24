import { ForbiddenException } from '@nestjs/common'
import { HttpExceptionOptions } from '@nestjs/common/exceptions/http.exception'

export class UserDeletedException {
  private static readonly message: string = 'User was deleted'
  constructor(descriptionOrOptions?: string | HttpExceptionOptions) {
    return new ForbiddenException(UserDeletedException.message, descriptionOrOptions)
  }
}
