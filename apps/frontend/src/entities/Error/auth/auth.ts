import { CommonApiError } from '@/entities/Error/error'
import {
  ACCOUNT_IS_NOT_ACTIVATED,
  ALREADY_REGISTERED,
  BAD_REQUEST,
  CAN_NOT_FIND_VERIFICATION_CODE,
  FORBIDDEN,
  INCORRECT_EMAIL_OR_PASSWORD,
  INCORRECT_PASSWORD,
  INVALID_VERIFICATION_CODE,
  NOT_FOUND,
  UNAUTHORIZED,
  USER_NOT_FOUND,
  VERIFICATION_CODE_EXPIRED
} from '@/shared/config/api.config'

interface IAuthApiError {
  isWrongEmailOrPassword(): boolean

  isInvalidEmail(): boolean

  isAlreadyRegistered(): boolean

  isInvalidVerificationCode(): boolean

  isNotActivatedUser(): boolean
}

export class AuthApiError extends CommonApiError implements IAuthApiError {
  public isWrongEmailOrPassword(): boolean {
    return this.errorCheck(UNAUTHORIZED, INCORRECT_EMAIL_OR_PASSWORD)
  }

  public isInvalidEmail(): boolean {
    return this.errorCheck(NOT_FOUND, USER_NOT_FOUND)
  }

  public isAlreadyRegistered(): boolean {
    return this.errorCheck(FORBIDDEN, ALREADY_REGISTERED)
  }

  public isInvalidVerificationCode(): boolean {
    return (
      this.errorCheck(NOT_FOUND, CAN_NOT_FIND_VERIFICATION_CODE) ||
      this.errorCheck(FORBIDDEN, VERIFICATION_CODE_EXPIRED) ||
      this.errorCheck(FORBIDDEN, INVALID_VERIFICATION_CODE)
    )
  }

  public isNotActivatedUser(): boolean {
    return this.errorCheck(BAD_REQUEST, ACCOUNT_IS_NOT_ACTIVATED)
  }

  public isPasswordIncorrect(): boolean {
    return this.errorCheck(FORBIDDEN, INCORRECT_PASSWORD)
  }
}
