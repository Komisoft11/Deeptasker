import { UniqueIdentifier } from '@dnd-kit/core'

export const TaskPlannerService = {
  parseIdentifier(idStr: UniqueIdentifier): number {
    const idNumber = Number(idStr)

    if (!idNumber) {
      throw new Error('Not parse container id status')
    }
    return idNumber
  }
}
