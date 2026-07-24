import { Controller, Get, Query, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileService } from '../file/services/file.service'
import type { Response } from 'express'
import { Readable } from 'stream'

@ApiTags('policies')
@Controller('policies')
export class PoliciesController {
  constructor(private readonly fileService: FileService) {
  }

  @Get('/consent-file')
  public async consentFile(
    @Query('download') download: string,
    @Res() res: Response
  ) {
    const fileId = 271
    const originalName = 'KOMISOFT_DEEPTASKER_CONSENT.pdf'

    const fileStream = (await this.fileService.getFileContent(fileId)) as Readable

    this.streamFileToResponse(res, fileStream, originalName, download)
  }

  @Get('/personal_data_policy')
  public async personalDataPolicyFile(
    @Query('download') download: string,
    @Res() res: Response
  ) {
    const fileId = 272
    const originalName = 'KOMISOFT_DEEPTASKER_PERSONAL_DATA_POLICY.pdf'

    const fileStream = (await this.fileService.getFileContent(fileId)) as Readable

    this.streamFileToResponse(res, fileStream, originalName, download)
  }

  @Get('/privacy_policy')
  public async privacyPolicyFile(
    @Query('download') download: string,
    @Res() res: Response
  ) {
    const fileId = 273
    const originalName = 'KOMISOFT_DEEPTASKER_PRIVACY_POLICY.pdf'

    const fileStream = (await this.fileService.getFileContent(fileId)) as Readable

    this.streamFileToResponse(res, fileStream, originalName, download)
  }

  @Get('/terms_of_use')
  public async termsOfUseFile(
    @Query('download') download: string,
    @Res() res: Response
  ) {
    const fileId = 274
    const originalName = 'KOMISOFT_DEEPTASKER_TERMS_OF_USE.pdf'

    const fileStream = (await this.fileService.getFileContent(fileId)) as Readable

    this.streamFileToResponse(res, fileStream, originalName, download)
  }

  @Get('/user_agreement')
  public async userAgreementFile(
    @Query('download') download: string,
    @Res() res: Response
  ) {
    const fileId = 275
    const originalName = 'KOMISOFT_DEEPTASKER_USER_AGREEMENT.pdf'

    const fileStream = (await this.fileService.getFileContent(fileId)) as Readable

    this.streamFileToResponse(res, fileStream, originalName, download)
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
