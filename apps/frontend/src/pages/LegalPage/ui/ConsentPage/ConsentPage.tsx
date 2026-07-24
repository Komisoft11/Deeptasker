import { consentConfig } from '@/widgets/Legal/const/content/consent'
import { LegalDocument } from '@/widgets/Legal/ui/LegalDocument/LegalDocument'

export const ConsentPage = () => {
  return <LegalDocument {...consentConfig} />
}
