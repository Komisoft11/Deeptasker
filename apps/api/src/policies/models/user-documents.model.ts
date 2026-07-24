import { BaseModel } from '@squareboat/nestjs-objection'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { UserModel } from '../../user/models/user.model'
import { ConsentModel } from './documents/consent.model'
import { PersonalDataPolicyModel } from './documents/personal-data-policy.model'
import { PrivacyPolicyModel } from './documents/privacy-policy.model'
import { TermsOfUseModel } from './documents/terms-of-use.model'
import { UserAgreementModel } from './documents/user-agreement.model'

export class UserDocumentsModel extends BaseModel {
  static tableName = 'user_documents'

  id!: number

  userId: number

  consentId: number

  personalDataPolicyId: number

  privacyPolicyId: number

  userAgreementId: number

  termsOfUseId: number

  dateCreated: Date

  dateAgreement?: Date

  dateDisagreement?: Date

  public async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    this.dateCreated = getCurrentUTCDateTime()
  }

  static relationMappings = {
    user: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserModel,
      join: {
        from: 'user_documents.userId',
        to: 'user.id'
      }
    },
    consent: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => ConsentModel,
      join: {
        from: 'user_documents.consentId',
        to: 'consent.id'
      }
    },
    personalDataPolicy: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => PersonalDataPolicyModel,
      join: {
        from: 'user_documents.personalDataPolicyId',
        to: 'personal_data_policy.id'
      }
    },
    privacyPolicy: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => PrivacyPolicyModel,
      join: {
        from: 'user_documents.privacyPolicyId',
        to: 'privacy_policy.id'
      }
    },
    userAgreement: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => UserAgreementModel,
      join: {
        from: 'user_documents.userAgreementId',
        to: 'user_agreement.id'
      }
    },
    termsOfUse: {
      relation: BaseModel.HasOneRelation,
      modelClass: () => TermsOfUseModel,
      join: {
        from: 'user_documents.termsOfUseId',
        to: 'terms_of_use.id'
      }
    }
  }
}
