import { BugReportPayload } from '@/widgets/Settings/SettingsSupport/BugForm/BugForm'
import { FeedbackFormData } from '@/widgets/Settings/SettingsSupport/FeedbackForm/FeedbackForm'
import { FileData } from '@/entities/TaskComment/model/types/task-comment.interface'
import axios from '@/shared/api/interceptors'


const getSupportUrl = (string: string = '') => `support/${string}`

export const SupportService = {
  async sendFeedback(dto: FeedbackFormData): Promise<void> {
    return (await axios.post(getSupportUrl('feedback-form'), dto)).data
  },

  async sendBugReport(dto: BugReportPayload): Promise<void> {
    return (await axios.post(getSupportUrl('bug-form'), dto)).data
  },

  async uploadBugFile(file: FormData): Promise<FileData> {
    return (
      await axios.post(getSupportUrl('file-upload-bug'), file, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    ).data
  }
}
