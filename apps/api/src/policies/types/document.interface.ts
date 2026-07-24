import {
  ConsentModel,
  PersonalDataPolicyModel,
  PrivacyPolicyModel,
  TermsOfUseModel,
  UserAgreementModel
} from '../models'

export interface Documents {
  consent: ConsentModel
  personalDataPolicy: PersonalDataPolicyModel
  privacyPolicy: PrivacyPolicyModel
  termsOfUse: TermsOfUseModel
  userAgreement: UserAgreementModel
}
