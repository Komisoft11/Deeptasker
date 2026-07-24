import React from 'react'
import { termsOfUseConfig } from '@/widgets/Legal/const/content/termsOfUse'
import { LegalDocument } from '@/widgets/Legal/ui/LegalDocument/LegalDocument'

export const TermsOfUsePage = () => {
  return <LegalDocument {...termsOfUseConfig} />
}
