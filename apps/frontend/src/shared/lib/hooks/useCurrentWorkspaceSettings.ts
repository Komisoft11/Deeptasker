import { useMatches } from 'react-router'
import {
  OptionWorkspaceTabs,
  optionWorkspaceTabs
} from '@/shared/config/route.config'

interface Return {
  tab: OptionWorkspaceTabs
}

export const useCurrentWorkspaceSettings = (): Return => {
  const matches = useMatches()

  const match = matches.find((m) => m.id === 'WORKSPACES ROUTES')
  const lastMatch = matches[matches.length - 1]

  if (!match?.params?.workspaceId) {
    return { tab: optionWorkspaceTabs.SETTINGS }
  }

  const split = lastMatch.pathname.split('/')
  const pathTab = split[split.length - 1]

  if (
    !Object.values(optionWorkspaceTabs).includes(pathTab as OptionWorkspaceTabs)
  ) {
    return { tab: optionWorkspaceTabs.SETTINGS }
  }

  return { tab: pathTab as OptionWorkspaceTabs }
}
