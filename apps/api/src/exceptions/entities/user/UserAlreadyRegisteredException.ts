import { ForbiddenException } from '@nestjs/common'
import { HttpExceptionOptions } from '@nestjs/common/exceptions/http.exception'

export class UserAlreadyRegisteredException extends ForbiddenException {
  private static readonly message: string = 'Email already registered'
  constructor(descriptionOrOptions?: string | HttpExceptionOptions) {
    super(UserAlreadyRegisteredException.message, descriptionOrOptions)
  }
}
