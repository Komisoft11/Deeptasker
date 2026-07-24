import { maxFileSize } from './file-storage'
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileService } from './services/file.service'
import { Auth } from '../auth/decorators/auth.decorator'
import { GlobalRole } from '../user/access/enum.role'
import { User } from '../auth/decorators/user.decorator'
import { ApiTags } from '@nestjs/swagger'
import type { BufferedFile } from './interfaces/buffered-file.interface'
import { TaskService } from '../task/services/task.service'
import { TaskAuthService } from '../task/auth/task-auth.service'
import { I18nContext, I18nService } from 'nestjs-i18n'
import type { Response } from 'express'
import { Readable } from 'stream'
import { UploadedFileResponse } from '../task/dto'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { FileModel } from './models/file.model'
import { UserModel } from '../user/models/user.model'
import { ReportService } from '../report/services/report.service'
import { ProjectAuthService } from '../project/auth/project-auth.service'

@Auth(GlobalRole.User)
@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(
    private readonly taskService: TaskService,
    private readonly taskAuthService: TaskAuthService,
    private readonly projectAuthService: ProjectAuthService,
    private readonly i18n: I18nService,
    private readonly fileService: FileService,
    private readonly reportService: ReportService,
    @InjectMapper() private readonly mapper: Mapper
  ) {
  }

  @Post('task/:taskId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToTask(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: maxFileSize
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    )
    file: BufferedFile,
    @Param('taskId', ParseIntPipe) taskId: number,
    @User() user: UserModel
  ): Promise<UploadedFileResponse> {
    const task = await this.taskService.getTask(taskId)

    if (!(await this.taskAuthService.modelAuth.canUpload(user, task))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const uploadedFile = await this.fileService.uploadToTask(
      task,
      { file: file, customName: file.originalname, filename: file.mimetype },
      user
    )

    return this.mapper.map(uploadedFile, FileModel, UploadedFileResponse)
  }

  @Post('task-comment/:taskCommentId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToTaskComment(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: maxFileSize
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    )
    file: BufferedFile,
    @Param('taskCommentId', ParseIntPipe) taskCommentId: number,
    @Body() body: { name: string; filename: string },
    @User() user: UserModel
  ): Promise<UploadedFileResponse> {
    const taskComment = await this.taskService.getTaskComment(taskCommentId)

    if (!this.taskAuthService.modelAuth.canUpdateComment(user, taskComment)) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const { name, filename } = body
    const task = await this.taskService.getTask(taskComment.taskId)

    const uploadedFile = await this.fileService.uploadToTaskComment(
      taskComment,
      task,
      { file: file, customName: name, filename: filename },
      user
    )

    return this.mapper.map(uploadedFile, FileModel, UploadedFileResponse)
  }

  @Get('task/:taskId/:fileId')
  async getTaskFile(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Query('download') download: string,
    @User() user: UserModel,
    @Res() res: Response
  ) {
    const task = await this.taskService.getTask(taskId)
    const taskFile = await this.fileService.getTaskFile(task, fileId)

    if (!(await this.taskAuthService.canReadTaskFile(user, taskFile))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const fileStream = (await this.fileService.getFileContent(taskFile.fileId)) as Readable

    this.streamFileToResponse(res, fileStream, taskFile.file.originalName, download)
  }

  @Get('task-comment/:commentId/:fileId')
  async getTaskCommentFile(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
    @Query('download') download: string,
    @User() user: UserModel,
    @Res() res: Response
  ) {
    const taskComment = await this.taskService.getTaskComment(commentId)
    const taskCommentFile = await this.fileService.getTaskCommentFile(taskComment, fileId)

    if (!(await this.taskAuthService.canRead(user, taskComment.taskId))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const fileStream = (await this.fileService.getFileContent(taskCommentFile.fileId)) as Readable

    this.streamFileToResponse(res, fileStream, taskCommentFile.file.originalName, download)
  }

  @Delete('task/:taskId/:fileId')
  async deleteTaskFile(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @User() user: UserModel
  ) {
    const task = await this.taskService.getTask(taskId)

    const taskFile = await this.fileService.getTaskFile(task, fileId)

    if (!(await this.taskAuthService.modelAuth.canDeleteTaskFile(user, taskFile))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.fileService.deleteTaskFile(task, taskFile, user)
  }

  @Delete('task-comment/:commentId/:fileId')
  async deleteTaskCommentFile(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
    @User() user: UserModel
  ) {
    const comment = await this.taskService.getTaskComment(commentId)

    const commentFile = await this.fileService.getTaskCommentFile(comment, fileId)

    if (!(await this.taskAuthService.modelAuth.canDeleteComment(user, comment))) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    return this.fileService.delete(commentFile.fileId)
  }

  @Get('report/:reportId')
  async getReportFile(
    @Param('reportId', ParseIntPipe) reportId: number,
    @Query('download') download: string,
    @User() user: UserModel,
    @Res() res: Response
  ) {
    const report = await this.reportService.getReportWithFile(reportId)

    if (!report) {
      throw new NotFoundException('Report not found: ' + reportId)
    }

    if (
      report.userId !== user.id &&
      !(await this.projectAuthService.canGenerateReports(user, report.projectId))
    ) {
      throw new ForbiddenException(
        this.i18n.t('project.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const fileStream = (await this.fileService.getFileContent(report.fileId)) as Readable

    this.streamFileToResponse(res, fileStream, report.file.originalName, download)
  }

  @Get('/user-avatar/:fileId')
  async getUserAvatar(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Query('download') download: string,
    @Res() res: Response
  ) {
    const userAvatarFile = await this.fileService.getUserAvatar(fileId)

    const fileStream = (await this.fileService.getFileContent(userAvatarFile.id)) as Readable

    this.streamFileToResponse(res, fileStream, userAvatarFile.originalName, download)
  }

  @Post('/user-avatar/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserAvatar(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: maxFileSize
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    )
    file: BufferedFile,
    @User() user: UserModel
  ): Promise<UploadedFileResponse> {
    const uploadedFile = await this.fileService.uploadUserAvatar(user, {
      file: file,
      customName: file.originalname,
      filename: file.mimetype
    })

    return this.mapper.map(uploadedFile, FileModel, UploadedFileResponse)
  }

  @Delete('/user-avatar/:fileId')
  async deleteUserAvatar(@Param('fileId', ParseIntPipe) fileId: number, @User() user: UserModel) {
    await this.fileService.deleteUserAvatar(user, fileId)
  }

  private streamFileToResponse(
    res: Response,
    fileStream: Readable,
    originalName: string,
    download?: string
  ) {
    if (download) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }

    res.setHeader('Content-disposition', 'attachment; filename=' + originalName)

    fileStream.pipe(res)
  }
}
