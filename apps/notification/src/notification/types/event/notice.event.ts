export interface NoticeEvent {
  EMAIL_CHANGE_PROCESSING: {
    newEmail: string
  }

  EMAIL_CHANGE_COMPLETED: {
    newEmail: string
  }

  PASSWORD_CHANGED: {
    date: Date
  }

  ACCOUNT_DELETED: {
    date: Date
  }
}
