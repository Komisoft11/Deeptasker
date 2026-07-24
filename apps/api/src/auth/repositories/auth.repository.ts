import { Injectable } from '@nestjs/common'
import { Repository } from '../../common/database/repository'
import { InjectModel } from '@squareboat/nestjs-objection'
import { RefreshModel } from '../models/refresh.model'
import { IAuthRepository } from './auth-repository.interface'
import { UserModel } from '../../user/models/user.model'
import { TransactionOrKnex } from 'objection'

@Injectable()
export class AuthRepository extends Repository<RefreshModel> implements IAuthRepository {
  @InjectModel(RefreshModel)
  model: RefreshModel

  public async logout(user: UserModel): Promise<void> {
    await RefreshModel.query().delete().where('userId', user.id)
  }

  public async getUser(token: RefreshModel): Promise<UserModel> {
    return token.$relatedQuery('user')
  }

  public async activate(user: UserModel, trx?: TransactionOrKnex): Promise<void> {
    await user.$query(trx).patch({
      isActivated: true
    })
  }

  public async findRefreshToken(token: string): Promise<RefreshModel | null> {
    return RefreshModel.query().findOne({ token: token })
  }

  public async createRefreshToken(
    user: UserModel,
    refreshToken: string,
    trx?: TransactionOrKnex
  ): Promise<RefreshModel> {
    await RefreshModel.query(trx).delete().where('userId', user.id)

    return RefreshModel.query(trx).insert({
      userId: user.id,
      token: refreshToken
    })
  }

  public async resetPassword(
    user: UserModel,
    newPassword: string,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await user.$query(trx).patch({
      password: newPassword
    })
  }

  public async updatePassword(user: UserModel, newPassword: string): Promise<void> {
    await user.$query().patch({ password: newPassword })
  }

  public async isUsernameExists(username: string): Promise<boolean> {
    return UserModel.query().where('username', username).exists()
  }
}
