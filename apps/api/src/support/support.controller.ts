import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { SupportService } from './support.service'
import { Auth } from '../auth/decorators/auth.decorator'
import { GlobalRole } from '../user/access/enum.role'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BugFormRequest, FeedbackFormRequest } from './dto'
import { User } from '../auth/decorators/user.decorator'
import { UserModel } from '../user/models/user.model'
import { FileInterceptor } from '@nestjs/platform-express'
import { maxFileSize } from '../file/file-storage'
import type { BufferedFile } from '../file/interfaces/buffered-file.interface'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { UploadedFileResponse } from '../task/dto'
import { FileModel } from '../file/models/file.model'

@ApiTags('support')
@Auth(GlobalRole.User)
@Controller('support')
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  @ApiOperation({
    summary: 'Get feedback',
    description: 'Submit user feedback form with rating, usability assessment, and suggestions'
  })
  @Post('/feedback-form')
  public async feedbackForm(
    @Body() feedbackFormRequest: FeedbackFormRequest,
    @User() user: UserModel
  ): Promise<void> {
    return this.supportService.feedbackForm(feedbackFormRequest, user)
  }

  @ApiOperation({
    summary: 'Get bug feedback',
    description: 'Submit bug report form with details about the issue encountered'
  })
  @Post('/bug-form')
  public async bugForm(
    @Body() bugFormRequest: BugFormRequest,
    @User() user: UserModel
  ): Promise<void> {
    return this.supportService.bugForm(bugFormRequest, user)
  }

  @ApiOperation({
    summary: 'Upload file attachment for bug report',
    description:
      'Allows users to upload screenshots, logs, or other files as attachments when submitting a bug report. The file is validated for size limits and saved to the server.'
  })
  @ApiOkResponse({
    type: UploadedFileResponse
  })
  @Post('/file-upload-bug')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadBugFile(
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
    const uploadedFile = await this.supportService.uploadBugFile(user, {
      file: file,
      customName: file.originalname,
      filename: file.mimetype
    })

    return this.mapper.map(uploadedFile, FileModel, UploadedFileResponse)
  }
}
