import { personalDataPolicyConfig } from '@/widgets/Legal/const/content/personalDataPolicy'
import { LegalDocument } from '@/widgets/Legal/ui/LegalDocument/LegalDocument'

export const PersonalDataPolicyPage = () => {
  return <LegalDocument {...personalDataPolicyConfig} />
}
