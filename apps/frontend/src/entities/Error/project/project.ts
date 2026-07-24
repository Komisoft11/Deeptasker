import { CommonApiError } from '@/entities/Error/error'
import {
  ALREADY_INVITED_PROJECT,
  ALREADY_MEMBER_PROJECT,
  FORBIDDEN,
  INVITATION_NOT_FOND,
  NOT_FOUND
} from '@/shared/config/api.config'

interface IProjectApiError {
  isAlreadyMember(): boolean
  isAlreadyInvited(): boolean
}

export class ProjectApiError
  extends CommonApiError
  implements IProjectApiError
{
  public isAlreadyMember(): boolean {
    return this.errorCheck(FORBIDDEN, ALREADY_MEMBER_PROJECT)
  }

  public isAlreadyInvited(): boolean {
    return this.errorCheck(FORBIDDEN, ALREADY_INVITED_PROJECT)
  }

  public isInvitationWrong(): boolean {
    return this.errorCheck(NOT_FOUND, INVITATION_NOT_FOND)
  }
}
