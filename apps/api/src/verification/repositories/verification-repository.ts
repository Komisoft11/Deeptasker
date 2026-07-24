import { Injectable } from '@nestjs/common'
import { Repository } from '../../common/database/repository'
import { InjectModel } from '@squareboat/nestjs-objection'
import { VerificationModel, VerificationType } from '../models/verification.model'
import { IVerificationRepository } from './verification-repository.interface'
import { TransactionOrKnex } from 'objection'

@Injectable()
export class VerificationRepository
  extends Repository<VerificationModel>
  implements IVerificationRepository
{
  @InjectModel(VerificationModel)
  model: VerificationModel

  private verificationType: VerificationType

  public setVerificationType(verificationType: VerificationType): void {
    this.verificationType = verificationType
  }

  public async createVerification(
    code: string,
    userId: number,
    trx?: TransactionOrKnex
  ): Promise<VerificationModel> {
    return VerificationModel.query(trx).insert({
      userId: userId,
      code: code,
      type: this.verificationType
    })
  }

  public async getVerification(userId: number): Promise<VerificationModel> {
    return VerificationModel.query().findOne({ userId, type: this.verificationType })
  }

  public async deleteVerification(userId: number, trx?: TransactionOrKnex): Promise<void> {
    await VerificationModel.query(trx)
      .where('userId', userId)
      .andWhere('type', this.verificationType)
      .delete()
  }
}
