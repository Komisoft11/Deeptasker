import { Auth } from '../auth/decorators/auth.decorator'
import { GlobalRole } from '../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { User } from '../auth/decorators/user.decorator'
import { UserModel } from '../user/models/user.model'
import { ICreatedRecord } from '../common/interfaces/created-record.interface'
import { I18nService } from 'nestjs-i18n'
import { ValidatePayloadExistsPipe } from '../common/helpers/pipes/validate-payload-exists.pipe'
import { ProjectService } from '../project/services/project/project.service'
import { FolderService } from './folder.service'
import { CreateFolderDto } from './dto/in/create-folder.dto'
import { UpdateFolderDto } from './dto/in/update-folder.dto'
import { ProjectAuthService } from '../project/auth/project-auth.service'

@Auth(GlobalRole.User)
@ApiTags('folders')
@Controller('folders')
export class FolderController {
  constructor(
    private readonly folderService: FolderService,
    private readonly projectService: ProjectService,
    private readonly i18n: I18nService,
    private readonly projectAuthService: ProjectAuthService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createFolderDto: CreateFolderDto,
    @User() user: UserModel
  ): Promise<ICreatedRecord> {
    const project = await this.projectService.get(createFolderDto.projectId)

    if (!(await this.projectAuthService.canCreateFolders(project, user))) {
      throw new ForbiddenException(this.i18n.t('auth.security.forbidden'))
    }

    const folder = await this.folderService.create(createFolderDto, user)

    return { id: folder.id, title: folder.title }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidatePayloadExistsPipe) updateFolderDto: UpdateFolderDto,
    @User() user: UserModel
  ): Promise<void> {
    const folder = await this.folderService.getFolder(id)
    const project = await this.projectService.get(folder.projectId)

    if (
      folder.userId !== user.id &&
      !(await this.projectAuthService.canEditFolders(project, user))
    ) {
      throw new ForbiddenException(this.i18n.t('auth.security.forbidden'))
    }

    return this.folderService.update(folder, updateFolderDto, user)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserModel): Promise<void> {
    const folder = await this.folderService.getFolder(id)
    const project = await this.projectService.get(folder.projectId)

    if (
      folder.userId !== user.id &&
      !(await this.projectAuthService.canDeleteFolders(project, user))
    ) {
      throw new ForbiddenException(this.i18n.t('auth.security.forbidden'))
    }

    return this.folderService.delete(folder, user)
  }
}
