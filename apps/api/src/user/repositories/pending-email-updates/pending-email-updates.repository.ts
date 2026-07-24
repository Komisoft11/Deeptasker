import { Injectable } from '@nestjs/common'
import { Repository } from '../../../common/database/repository'
import { InjectModel } from '@squareboat/nestjs-objection'
import { IPendingEmailUpdatesRepository } from './pending-email-updates-repository.interface'
import { PendingEmailUpdatesModel } from '../../models/pending-email-updates.model'
import { UserModel } from '../../models/user.model'
import { TransactionOrKnex } from 'objection'

@Injectable()
export class PendingEmailUpdatesRepository
  extends Repository<PendingEmailUpdatesModel>
  implements IPendingEmailUpdatesRepository
{
  @InjectModel(PendingEmailUpdatesModel)
  model: PendingEmailUpdatesModel

  public async createEmailPending(
    email: string,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await PendingEmailUpdatesModel.query(trx).insert({
      email: email,
      userId: user.id
    })
  }

  public async getPendingEmailByUser(user: UserModel): Promise<PendingEmailUpdatesModel> {
    return PendingEmailUpdatesModel.query().findOne('userId', user.id)
  }

  public async deletePendingEmailByUser(
    user: UserModel,
    email: string,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await PendingEmailUpdatesModel.query(trx)
      .where('userId', user.id)
      .andWhere('email', email)
      .delete()
  }

  public async isEmailAlreadyPending(email: string): Promise<boolean> {
    return PendingEmailUpdatesModel.query().where('email', email).exists()
  }
}
