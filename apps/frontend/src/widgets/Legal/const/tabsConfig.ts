import {
  ConsentPage,
  PersonalDataPolicyPage,
  PrivacyPolicyPage,
  TermsOfUsePage,
  UserAgreementPage
} from '@/pages/LegalPage/ui'
import { legalTab } from '@/shared/config/route.config'

export const LEGAL_TABS_CONFIG = [
  {
    slug: legalTab.CONSENT,
    label: 'Согласие на опд',
    component: ConsentPage
  },
  {
    slug: legalTab.PERSONAL_DATA_POLICY,
    label: 'Политика опд',
    component: PersonalDataPolicyPage
  },
  {
    slug: legalTab.PRIVACY_POLICY,
    label: 'Политика конфиденциальности',
    component: PrivacyPolicyPage
  },
  {
    slug: legalTab.USER_AGREEMENT,
    label: 'Пользовательское соглашение',
    component: UserAgreementPage
  },
  {
    slug: legalTab.TERMS_OF_USE,
    label: 'Правила пользования',
    component: TermsOfUsePage
  }
] as const
