import { Auth } from '../../../auth/decorators/auth.decorator'
import { GlobalRole } from '../../../user/access/enum.role'
import { ApiTags } from '@nestjs/swagger'
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { ProjectService } from '../../../project/services/project/project.service'
import { TagModel } from '../models/tag.model'
import { ProjectAuthService } from '../../../project/auth/project-auth.service'
import { TaskTagService } from '../services/task-tag.service'
import { User } from '../../../auth/decorators/user.decorator'
import { UserModel } from '../../../user/models/user.model'
import { CreateTagDto } from '../dto/in/create-tag.dto'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { TagResponse } from '../../dto'
import type { Mapper } from '@automapper/core'
import { InjectMapper } from '@automapper/nestjs'
import { generateFgColorForBg } from '../../../common/helpers/color'
import { UpdateTagDto } from '../dto/in/update-tag.dto'

@Auth(GlobalRole.User)
@ApiTags('tags')
@Controller('projects/:projectId/tags')
export class TagController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectAuthService: ProjectAuthService,
    private readonly tagService: TaskTagService,
    private readonly i18n: I18nService,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  @Post()
  public async create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createTagDto: CreateTagDto,
    @User() user: UserModel
  ): Promise<TagResponse> {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canUpdate(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', { lang: I18nContext.current().lang })
      )
    }

    const tag = await this.tagService.createTag(createTagDto, user, project)

    return {
      id: tag.id,
      name: tag.name,
      colorBg: tag.color,
      colorFg: generateFgColorForBg(tag.color)
    }
  }

  @Get()
  public async getTags(
    @Param('projectId', ParseIntPipe) projectId: number,
    @User() user: UserModel
  ): Promise<TagResponse[]> {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canRead(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', { lang: I18nContext.current().lang })
      )
    }

    const tags = await this.tagService.getByProject(project.id)

    return this.mapper.mapArray(tags, TagModel, TagResponse)
  }

  @Delete(':tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteTag(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
    @User() user: UserModel
  ) {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canUpdate(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', { lang: I18nContext.current().lang })
      )
    }

    await this.tagService.deleteTag(tagId, user, project)
  }

  @Patch(':tagId')
  public async update(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
    @Body() updateTagDto: UpdateTagDto,
    @User() user: UserModel
  ): Promise<void> {
    const project = await this.projectService.get(projectId)

    if (!(await this.projectAuthService.canUpdate(user, project))) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', { lang: I18nContext.current().lang })
      )
    }

    await this.tagService.updateTag(tagId, user, project, updateTagDto)
  }
}
