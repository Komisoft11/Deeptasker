import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { UserDocumentsModel } from '../../models'
import { TransactionOrKnex } from 'objection'
import { Documents } from '../../types'
import { AgreeWithPolicyRequest } from '../../dto'

export const USER_DOCUMENTS_REPOSITORY = 'user_documents_repository'

export interface IUserDocumentsRepository extends RepositoryContract<UserDocumentsModel> {
  query<R = UserDocumentsModel>(): CustomQueryBuilder<UserDocumentsModel, R>

  agreeWithPolitics(
    dto: AgreeWithPolicyRequest,
    documents: Documents,
    trx?: TransactionOrKnex
  ): Promise<void>

  getLastVersionsDocuments(): Promise<Documents>
}
