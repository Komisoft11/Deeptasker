import { useMatches } from 'react-router'
import {
  OptionProjectTabs,
  optionProjectTabs
} from '@/shared/config/route.config'

interface Return {
  tab: OptionProjectTabs
}

export const useCurrentProjectSettings = (): Return => {
  const matches = useMatches()

  const match = matches.find((m) => m.id === 'PROJECTS ROUTES')
  const lastMatch = matches[matches.length - 1]

  if (!match?.params?.projectId) {
    return { tab: optionProjectTabs.GENERAL }
  }

  const split = lastMatch.pathname.split('/')
  const pathTab = split[split.length - 1]

  if (
    !Object.values(optionProjectTabs).includes(pathTab as OptionProjectTabs)
  ) {
    return { tab: optionProjectTabs.GENERAL }
  }

  return { tab: pathTab as OptionProjectTabs }
}
