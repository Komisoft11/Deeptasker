import { LEGAL_URL, LegalTabs, legalTab } from '@/shared/config/route.config'

export const LegalNavigator = {
  getLegalTab({ tab = legalTab.CONSENT }: { tab?: LegalTabs }): string {
    return `${LEGAL_URL}/${tab}`
  }
} as const
