import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { UserModel } from '../../models/user.model'
import { TransactionOrKnex } from 'objection'
import { IUserEmail } from '../../../common/interfaces/user-email'
import { CreateUserDto } from '../../dto/in/create-user.dto'
import { UpdateUserFieldsDto } from '../../dto/update-user-fields.dto'
import { FileModel } from '../../../file/models/file.model'

export const USER_REPOSITORY = 'user_repository'

export interface IUserRepository extends RepositoryContract<UserModel> {
  query<R = UserModel>(): CustomQueryBuilder<UserModel, R>

  createUser(dto: CreateUserDto, isActivated: boolean, trx?: TransactionOrKnex): Promise<UserModel>

  getUser(userId: number, trx?: TransactionOrKnex): Promise<UserModel>

  findNotInProject(query: string, excludeProjectId: number): Promise<UserModel[]>

  findNotInWorkspaceAdminsAndInvitees(
    query: string,
    excludeWorkspaceAdminsId: number,
    excludeWorkspaceInviteesId: number
  ): Promise<UserModel[]>

  findNotInWorkspaceAdmins(query: string, excludeWorkspaceAdminsId: number): Promise<UserModel[]>

  findNotInWorkspaceInvitees(
    query: string,
    excludeWorkspaceInviteesId: number
  ): Promise<UserModel[]>

  findInProject(query: string, projectId: number): Promise<UserModel[]>

  getFindBaseUserFindQuery(query: string): CustomQueryBuilder<UserModel, UserModel[]>

  changePassword(user: UserModel, newPassword: string): Promise<void>

  getAll(): Promise<UserModel[]>

  deleteUser(user: UserModel, trx?: TransactionOrKnex): Promise<void>

  getUserByEmail(email: string): Promise<UserModel | null>

  getUserByActivationLink(link: string): Promise<UserModel>

  getUserByUsername(dto: IUserEmail): Promise<UserModel | null>

  getUserByResetPasswordCode(resetPasswordCode: string): Promise<UserModel | null>

  updateUser(
    user: UserModel,
    updateDto: UpdateUserFieldsDto,
    trx?: TransactionOrKnex
  ): Promise<void>

  getByIds(ids: number[]): Promise<UserModel[]>

  updateProfileAvatar(
    user: UserModel,
    uploadedFile: FileModel,
    trx?: TransactionOrKnex
  ): Promise<void>

  getDeletedUserByEmail(email: string): Promise<UserModel | null>

  removeProfileAvatar(user: UserModel, trx?: TransactionOrKnex): Promise<void>

  isUserExists(userId: number): Promise<boolean>

  isUsernameAvailable(username: string): Promise<boolean>
}
