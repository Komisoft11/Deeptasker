import { CommonApiError } from '@/entities/Error/error'
import { FORBIDDEN, SPRINT_FORBIDDEN } from '@/shared/config/api.config'

interface ISprintError {
  isForbidden(): boolean
}

export class SprintApiError extends CommonApiError implements ISprintError {
  public isForbidden(): boolean {
    return this.errorCheck(FORBIDDEN, SPRINT_FORBIDDEN)
  }
}