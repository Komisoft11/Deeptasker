import { InjectModel } from '@squareboat/nestjs-objection'
import { Injectable } from '@nestjs/common'
import { Repository } from '../../../common/database/repository'
import {
  ConsentModel,
  PersonalDataPolicyModel,
  PrivacyPolicyModel,
  TermsOfUseModel,
  UserAgreementModel,
  UserDocumentsModel
} from '../../models'
import { IUserDocumentsRepository } from './user-documents-repository.interface'
import { TransactionOrKnex } from 'objection'
import { Documents } from '../../types'
import { AgreeWithPolicyRequest } from '../../dto'

@Injectable()
export class UserDocumentsRepository
  extends Repository<UserDocumentsModel>
  implements IUserDocumentsRepository
{
  @InjectModel(UserDocumentsModel)
  model: UserDocumentsModel

  public async getLastVersionsDocuments(): Promise<Documents> {
    const [consent, personalDataPolicy, privacyPolicy, termsOfUse, userAgreement] =
      await Promise.all([
        this.getLatestConsent(),
        this.getLatestPersonalDataPolicy(),
        this.getLatestPrivacyPolicy(),
        this.getLatestTermsOfUse(),
        this.getLatestUserAgreement()
      ])

    return { consent, personalDataPolicy, privacyPolicy, termsOfUse, userAgreement }
  }

  public async agreeWithPolitics(
    dto: AgreeWithPolicyRequest,
    documents: Documents,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await UserDocumentsModel.query(trx).insert({
      userId: dto.user.id,
      consentId: documents.consent.id,
      personalDataPolicyId: documents.personalDataPolicy.id,
      privacyPolicyId: documents.privacyPolicy.id,
      userAgreementId: documents.userAgreement.id,
      termsOfUseId: documents.termsOfUse.id,
      dateCreated: dto.agreeDate,
      dateAgreement: dto.agreeDate
    })
  }

  private async getLatestConsent(): Promise<ConsentModel> {
    return ConsentModel.query()
      .whereNot('datePublished', null)
      .andWhere('dateExpired', null)
      .orderBy('dateCreated', 'desc')
      .first()
  }
  private async getLatestPersonalDataPolicy(): Promise<PersonalDataPolicyModel> {
    return PersonalDataPolicyModel.query()
      .whereNot('datePublished', null)
      .andWhere('dateExpired', null)
      .orderBy('dateCreated', 'desc')
      .first()
  }
  private async getLatestPrivacyPolicy(): Promise<PrivacyPolicyModel> {
    return PrivacyPolicyModel.query()
      .whereNot('datePublished', null)
      .andWhere('dateExpired', null)
      .orderBy('dateCreated', 'desc')
      .first()
  }
  private async getLatestTermsOfUse(): Promise<TermsOfUseModel> {
    return TermsOfUseModel.query()
      .whereNot('datePublished', null)
      .andWhere('dateExpired', null)
      .orderBy('dateCreated', 'desc')
      .first()
  }
  private async getLatestUserAgreement(): Promise<UserAgreementModel> {
    return UserAgreementModel.query()
      .whereNot('datePublished', null)
      .andWhere('dateExpired', null)
      .orderBy('dateCreated', 'desc')
      .first()
  }
}
