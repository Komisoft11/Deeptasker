type PolicyType =
  | 'consent'
  | 'personalDataPolicy'
  | 'privacyPolicy'
  | 'termsOfUse'
  | 'userAgreement'

export interface UpdatePolicyEvent {
  UPDATE_POLICY: {
    policyType: PolicyType
    policyLink: string
    dateUpdated: Date
  }
}
