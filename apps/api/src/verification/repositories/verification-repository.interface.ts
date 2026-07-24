import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { VerificationModel, VerificationType } from '../models/verification.model'
import { TransactionOrKnex } from 'objection'

export const VERIFICATION_REPOSITORY = 'verification_repository'

export interface IVerificationRepository extends RepositoryContract<VerificationModel> {
  query<R = VerificationModel>(): CustomQueryBuilder<VerificationModel, R>

  setVerificationType(verificationType: VerificationType): void

  createVerification(
    code: string,
    userId: number,
    trx?: TransactionOrKnex
  ): Promise<VerificationModel>

  getVerification(userId: number): Promise<VerificationModel>

  deleteVerification(userId: number, trx?: TransactionOrKnex): Promise<void>
}
