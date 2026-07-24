import { Injectable } from '@nestjs/common'
import { Repository } from '../../../common/database/repository'
import { CustomQueryBuilder, InjectModel } from '@squareboat/nestjs-objection'
import { UserModel } from '../../models/user.model'
import { hash } from '../../../auth/utilities/password'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { IUserRepository } from './user-repository.interface'
import { raw, TransactionOrKnex } from 'objection'
import { encodeHtmlTags } from '../../../common/decorators/strip-tags.decorator'
import { generateFgColorForBg, generateRandomBgColor } from '../../../common/helpers/color'
import { ProjectPermissionsModel } from '../../../project/models/project-permissions.model'
import { WorkspacePermissionsModel } from '../../../workspace/models/workspace-permissions.model'
import { IUserEmail } from '../../../common/interfaces/user-email'
import { CreateUserDto } from '../../dto/in/create-user.dto'
import { UpdateUserFieldsDto } from '../../dto/update-user-fields.dto'
import { FileModel } from '../../../file/models/file.model'
import { WorkspaceInvitationsModel } from '../../../workspace/models/workspace-invitations.model'

@Injectable()
export class UserRepository extends Repository<UserModel> implements IUserRepository {
  @InjectModel(UserModel)
  model: UserModel

  public static UserRoles = {
    Admin: 'admin',
    User: 'user'
  }

  public async createUser(
    dto: CreateUserDto,
    isActivated: boolean,
    trx?: TransactionOrKnex
  ): Promise<UserModel> {
    encodeHtmlTags(dto)

    const bgColor = generateRandomBgColor()
    const fgColor = generateFgColorForBg(bgColor)

    return UserModel.query(trx).insert({
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: dto.username,
      email: dto.email,
      password: dto.password,
      role: UserRepository.UserRoles.User,
      isActivated: isActivated,
      iconBg: bgColor,
      iconFg: fgColor
    })
  }

  public async getUser(userId: number, trx?: TransactionOrKnex): Promise<UserModel> {
    return UserModel.query(trx).findById(userId).andWhere('dateDeleted', null)
  }

  public async changePassword(user: UserModel, newPassword: string): Promise<void> {
    await this.update(user, {
      password: await hash(newPassword)
    })
  }

  public async getAll(): Promise<UserModel[]> {
    return this.all()
  }

  public async deleteUser(user: UserModel, trx?: TransactionOrKnex): Promise<void> {
    await user.$query(trx).patch({
      dateDeleted: getCurrentUTCDateTime()
    })
  }

  public async findNotInProject(query: string, excludeProjectId: number): Promise<UserModel[]> {
    return this.getFindBaseUserFindQuery(query).whereNotIn(
      'id',
      ProjectPermissionsModel.query().select('userId').where('projectId', excludeProjectId)
    )
  }

  public async findNotInWorkspaceAdminsAndInvitees(
    query: string,
    excludeWorkspaceAdminsId: number,
    excludeWorkspaceInviteesId: number
  ): Promise<UserModel[]> {
    return this.getFindBaseUserFindQuery(query)
      .whereNotIn(
        'id',
        WorkspacePermissionsModel.query()
          .select('userId')
          .where('workspaceId', excludeWorkspaceAdminsId)
      )
      .whereNotIn(
        'email',
        WorkspaceInvitationsModel.query()
          .select('email')
          .where('workspaceId', excludeWorkspaceInviteesId)
      )
  }

  public async findNotInWorkspaceAdmins(
    query: string,
    excludeWorkspaceAdminsId: number
  ): Promise<UserModel[]> {
    return this.getFindBaseUserFindQuery(query).whereNotIn(
      'id',
      WorkspacePermissionsModel.query()
        .select('userId')
        .where('workspaceId', excludeWorkspaceAdminsId)
    )
  }

  public async findNotInWorkspaceInvitees(
    query: string,
    excludeWorkspaceInviteesId: number
  ): Promise<UserModel[]> {
    return this.getFindBaseUserFindQuery(query).whereNotIn(
      'email',
      WorkspaceInvitationsModel.query()
        .select('email')
        .where('workspaceId', excludeWorkspaceInviteesId)
    )
  }

  public async findInProject(query: string, projectId: number): Promise<UserModel[]> {
    return this.getFindBaseUserFindQuery(query).whereIn(
      'id',
      ProjectPermissionsModel.query().select('userId').where('projectId', projectId)
    )
  }

  public getFindBaseUserFindQuery(query: string): CustomQueryBuilder<UserModel, UserModel[]> {
    if (!query) query = ''

    query = query.trim().toLowerCase()

    const isEmail = query.includes('@')

    return UserModel.query()
      .select('id', 'firstName', 'lastName', 'username', 'iconFg', 'iconBg', 'email', 'avatarId')
      .where(builder =>
        isEmail
          ? builder.where('email', 'like', `%${query}%`)
          : query === ''
          ? true
          : builder
              .orWhere(raw(`lower(concat(first_name, ' ', last_name))`), 'like', `%${query}%`)
              .orWhere(raw('lower(username)'), 'like', `%${query}%`)
      )
      .where('dateDeleted', null)
      .limit(20)
  }

  public async getUserByEmail(email: string): Promise<UserModel | null> {
    return UserModel.query().findOne({ email: email, dateDeleted: null })
  }

  public async getUserByActivationLink(link: string): Promise<UserModel> {
    return UserModel.query().findOne({
      activationLink: link,
      dateDeleted: null
    })
  }

  public async getUserByUsername(dto: IUserEmail): Promise<UserModel | null> {
    return UserModel.query().findOne({
      username: dto.username,
      dateDeleted: null
    })
  }

  public async getUserByResetPasswordCode(resetPasswordCode: string): Promise<UserModel | null> {
    return UserModel.query().findOne({
      passwordResetCode: resetPasswordCode,
      dateDeleted: null
    })
  }

  public async updateUser(
    user: UserModel,
    updateDto: UpdateUserFieldsDto,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await user.$query(trx).patch(updateDto)
  }

  public async getByIds(ids: number[]): Promise<UserModel[]> {
    return UserModel.query().whereIn('id', ids).andWhere('dateDeleted', null)
  }

  public async updateProfileAvatar(
    user: UserModel,
    uploadedFile: FileModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await user.$query(trx).patch({
      avatarId: uploadedFile.id
    })
  }

  public async removeProfileAvatar(user: UserModel, trx?: TransactionOrKnex): Promise<void> {
    await user.$query(trx).patch({
      avatarId: null
    })
  }

  public async getDeletedUserByEmail(email: string): Promise<UserModel | null> {
    return UserModel.query().where('email', email).andWhereNot('dateDeleted', null).first()
  }

  public async recoverUser(user: UserModel, trx?: TransactionOrKnex): Promise<void> {
    await user.$query(trx).patch({
      dateDeleted: null
    })
  }

  public async isUserExists(userId: number): Promise<boolean> {
    return UserModel.query().where('id', userId).where('dateDeleted', null).exists()
  }

  public async isUsernameAvailable(username: string): Promise<boolean> {
    const exists = await UserModel.query().where('username', username).exists()
    return !exists
  }
}
