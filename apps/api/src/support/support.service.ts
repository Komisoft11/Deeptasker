import { Injectable } from '@nestjs/common'
import { BugFormRequest, FeedbackFormRequest } from './dto'
import { UserModel } from '../user/models/user.model'
import { FileService, IFile } from '../file/services/file.service'
import { FileModel } from '../file/models/file.model'

@Injectable()
export class SupportService {
  constructor(private readonly fileService: FileService) {}

  public async feedbackForm(
    feedbackFormRequest: FeedbackFormRequest,
    user: UserModel
  ): Promise<void> {
    // email.service.send()
    console.log(`Feedback Form by ${user.username}: %o`, feedbackFormRequest)
  }

  public async bugForm(bugFormRequest: BugFormRequest, user: UserModel): Promise<void> {
    // email.service.send()
    console.log(`Bug Form by ${user.username}: %o`, bugFormRequest)
  }

  public async uploadBugFile(user: UserModel, file: IFile): Promise<FileModel> {
    return this.fileService.upload(file, `bug-form/${user.id}`, user.id)
  }
}
