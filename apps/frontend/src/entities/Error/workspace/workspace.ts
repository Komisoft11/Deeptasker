import { CommonApiError, CommonClientError } from '@/entities/Error/error'
import {
  ALREADY_ADMIN_WORKSPACE,
  ALREADY_INVITED_WORKSPACE,
  FORBIDDEN
} from '@/shared/config/api.config'

interface IWorkspaceClientError {
  isEmpty(): boolean
}

interface IWorkspaceApiError {}

export class WorkspaceClientError
  extends CommonClientError
  implements IWorkspaceClientError
{
  public isEmpty(): boolean {
    return this.errorCheck(
      "TypeError: Cannot read properties of undefined (reading 'id')"
    )
  }
}

export class WorkspaceApiError
  extends CommonApiError
  implements IWorkspaceApiError
{
  public isAlreadyAdmin(): boolean {
    return this.errorCheck(FORBIDDEN, ALREADY_ADMIN_WORKSPACE)
  }

  public isAlreadyInvited(): boolean {
    return this.errorCheck(FORBIDDEN, ALREADY_INVITED_WORKSPACE)
  }
}
