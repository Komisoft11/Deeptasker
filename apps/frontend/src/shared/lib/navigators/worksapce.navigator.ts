import {
  OptionWorkspaceTabs,
  SPACE_URL,
  WORKSPACES_URL,
  optionWorkspaceTabs
} from '@/shared/config/route.config'

interface WorkspaceUrlWithIdDto {
  currentWorkspaceId: number
  workspaceId: number
  tab?: OptionWorkspaceTabs
}

export const WorkspacesNavigator = {
  getWorkspaceGridUrl(currentWorkspaceId: number): string {
    return `${SPACE_URL}/${currentWorkspaceId}/${WORKSPACES_URL}`
  },

  getWorkspaceUrlWithId({
    currentWorkspaceId,
    workspaceId,
    tab = optionWorkspaceTabs.SETTINGS
  }: WorkspaceUrlWithIdDto): string {
    return (
      this.getWorkspaceGridUrl(currentWorkspaceId) + `/${workspaceId}/${tab}`
    )
  }
} as const
