import { SPACE_URL } from '@/shared/config/route.config'
import { ltrim } from '@/shared/lib/helpers/string.helper'

export const MainPageNavigator = {
  changeNextParamAfterMatch(matchParam: string, newParamValue: string): string {
    matchParam = ltrim(matchParam, '/')
    const pathParts = location.pathname.split('/')

    const matchIndex = pathParts.findIndex((part) => part === matchParam)

    if (matchIndex !== -1 && matchIndex < pathParts.length - 1) {
      pathParts[matchIndex + 1] = newParamValue
    }

    return pathParts.join('/')
  },

  getEmptyProjectUrl(currentWorkspaceId: number): string {
    return `${SPACE_URL}/${currentWorkspaceId}`
  }
} as const
