import React from 'react'
import { userAgreementConfig } from '@/widgets/Legal/const/content/userAgreement'
import { LegalDocument } from '@/widgets/Legal/ui/LegalDocument/LegalDocument'

export const UserAgreementPage = () => {
  return <LegalDocument {...userAgreementConfig} />
}
