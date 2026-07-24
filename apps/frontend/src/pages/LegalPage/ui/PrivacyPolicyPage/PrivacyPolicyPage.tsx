import { privacyConfig } from '@/widgets/Legal/const/content/privacy'
import { LegalDocument } from '@/widgets/Legal/ui/LegalDocument/LegalDocument'

export const PrivacyPolicyPage = () => {
  return <LegalDocument {...privacyConfig} />
}
