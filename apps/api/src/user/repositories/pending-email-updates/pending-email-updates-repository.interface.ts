import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { PendingEmailUpdatesModel } from '../../models/pending-email-updates.model'
import { UserModel } from '../../models/user.model'
import { TransactionOrKnex } from 'objection'

export const PENDING_EMAIL_UPDATES_REPOSITORY = 'pending_email_email_repository'

export interface IPendingEmailUpdatesRepository
  extends RepositoryContract<PendingEmailUpdatesModel> {
  query<R = PendingEmailUpdatesModel>(): CustomQueryBuilder<PendingEmailUpdatesModel, R>

  createEmailPending(email: string, user: UserModel, trx?: TransactionOrKnex): Promise<void>

  getPendingEmailByUser(user: UserModel): Promise<PendingEmailUpdatesModel>

  deletePendingEmailByUser(user: UserModel, email: string, trx?: TransactionOrKnex): Promise<void>

  isEmailAlreadyPending(email: string): Promise<boolean>
}
