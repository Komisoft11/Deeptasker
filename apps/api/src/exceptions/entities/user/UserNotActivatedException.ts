import { BadRequestException } from '@nestjs/common'
import { HttpExceptionOptions } from '@nestjs/common/exceptions/http.exception'

export class UserNotActivatedException extends BadRequestException {
  private static readonly message: string = 'Account is not activated'
  constructor(descriptionOrOptions?: string | HttpExceptionOptions) {
    super(UserNotActivatedException.message, descriptionOrOptions)
  }
}
