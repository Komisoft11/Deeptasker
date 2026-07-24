import { SPACE_URL, SPRINTS_URL } from '@/shared/config/route.config'

interface SprintsUrlDto {
  currentWorkspaceId: number
  projectSlug: string
}

interface SprintIdUrlDto extends SprintsUrlDto {
  sprintId: number
}

export const SprintsNavigator = {
  getSprintsUrl({ currentWorkspaceId, projectSlug }: SprintsUrlDto): string {
    return `${SPACE_URL}/${currentWorkspaceId}/p/${projectSlug}/${SPRINTS_URL}`
  },

  getSprintIdUrl({
    currentWorkspaceId,
    sprintId,
    projectSlug
  }: SprintIdUrlDto): string {
    return (
      this.getSprintsUrl({ currentWorkspaceId, projectSlug }) + `/${sprintId}`
    )
  }
} as const
