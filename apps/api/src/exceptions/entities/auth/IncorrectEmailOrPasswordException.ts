import { UnauthorizedException } from '@nestjs/common'
import { HttpExceptionOptions } from '@nestjs/common/exceptions/http.exception'

export class IncorrectEmailOrPasswordException extends UnauthorizedException {
  private static readonly message: string = 'Incorrect email or password'
  constructor(descriptionOrOptions?: string | HttpExceptionOptions) {
    super(IncorrectEmailOrPasswordException.message, descriptionOrOptions)
  }
}
