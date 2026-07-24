import { NotFoundException } from '@nestjs/common'
import { HttpExceptionOptions } from '@nestjs/common/exceptions/http.exception'

export class UserNotFoundException extends NotFoundException {
  private static readonly message: string = 'User not found'

  constructor(descriptionOrOptions?: string | HttpExceptionOptions) {
    super(UserNotFoundException.message, descriptionOrOptions)
  }

  public static isUserNotFoundException(e: unknown): e is UserNotFoundException {
    return e instanceof NotFoundException && e?.message === UserNotFoundException.message
  }
}
