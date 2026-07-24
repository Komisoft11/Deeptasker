import { CommonApiError } from '@/entities/Error/error'
import {
  FORBIDDEN,
  INVITATION_NOT_FOND,
  INVITATION_NOT_VALID,
  NOT_FOUND
} from '@/shared/config/api.config'

interface IInvitationApiError {
  isInvitationNotFound(): boolean
  isInvitationInvalid(): boolean
}

export class InvitationApiError
  extends CommonApiError
  implements IInvitationApiError
{
  public isInvitationNotFound(): boolean {
    return this.errorCheck(NOT_FOUND, INVITATION_NOT_FOND)
  }
  public isInvitationInvalid(): boolean {
    return this.errorCheck(FORBIDDEN, INVITATION_NOT_VALID)
  }
}
