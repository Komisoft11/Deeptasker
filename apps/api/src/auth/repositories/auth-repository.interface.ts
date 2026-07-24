import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { RefreshModel } from '../models/refresh.model'
import { UserModel } from '../../user/models/user.model'
import { TransactionOrKnex } from 'objection'

export const AUTH_REPOSITORY = 'auth_repository'

export interface IAuthRepository extends RepositoryContract<RefreshModel> {
  query<R = RefreshModel>(): CustomQueryBuilder<RefreshModel, R>

  logout(user: UserModel): Promise<void>

  getUser(token: RefreshModel): Promise<UserModel>

  activate(user: UserModel, trx?: TransactionOrKnex): Promise<void>

  findRefreshToken(token: string): Promise<RefreshModel | null>

  createRefreshToken(
    user: UserModel,
    refreshToken: string,
    trx?: TransactionOrKnex
  ): Promise<RefreshModel>

  resetPassword(user: UserModel, newPassword: string, trx?: TransactionOrKnex): Promise<void>

  updatePassword(user: UserModel, newPassword: string): Promise<void>

  isUsernameExists(username: string): Promise<boolean>
}
