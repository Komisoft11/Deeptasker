enum LocationOption {
  AUTH = 'auth',
  DASHBOARD = 'dashboard',
  TASK_CREATION = 'taskCreation',
  TASK_EDITING = 'taskEditing',
  BOARD = 'board',
  NOTIFICATIONS = 'notifications',
  SETTINGS = 'settings'
}

type BugFormFile = {
  id: number
  originalName: string
  filePath: string
}

type UserEnvironment = {
  userAgent: string
  platform: string
  screenResolution: string
  viewportSize: string
  browserLanguage: string
  timeZone: string
  url: string
  appVersion: string
  build: string
  featureFlags: { newDragDrop: boolean }
  consoleLogs: string[]
  errorStack: string
}

export interface BugReportEvent {
  BUG_REPORT: {
    titleField: string
    location: LocationOption | string
    actual: string
    expected: string
    files: BugFormFile[]
    environment: UserEnvironment
  }
}
