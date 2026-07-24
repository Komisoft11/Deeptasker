// SPACE = WORKSPACE
export const SPACE_URL: string = '/space'
export const SPACE_ID_URL: string = ':spaceId'
export const SPACE_WITH_ID_URL: string = SPACE_URL + '/' + SPACE_ID_URL

// WORKSPACES
export const WORKSPACES_URL: string = 'workspaces'
export const WORKSPACES_ID_URL: string = ':workspaceId'

// PROJECTS
export const PROJECTS_URL: string = 'projects'
export const PROJECTS_TEMPLATE_URL: string = 'template'
export const PROJECTS_TEMPLATE_ID_URL: string = ':projectTemplateId'
export const PROJECTS_ID_URL: string = ':projectId'
export const PROJECTS_SLUG_URL: string = 'p'
export const PROJECTS_SLUG_ID_URL: string = ':slugId'
export const PROJECTS_CREATE_REPORT: string = 'report'
export const REPORTS_URL: string = 'reports'
export const FOLDER_URL: string = 'folder'
export const FOLDER_ID_URL: string = ':folderId'
export const FOLDER_WITH_ID_URL: string = FOLDER_URL + '/' + FOLDER_ID_URL
export const PROJECTS_WITH_SLUG_ID_URL: string =
  PROJECTS_SLUG_URL + '/' + PROJECTS_SLUG_ID_URL
export const PROJECTS_WITH_SLUG_ID_WITH_FOLDER_URL: string =
  PROJECTS_WITH_SLUG_ID_URL + '/' + FOLDER_WITH_ID_URL
export const SPRINTS_URL: string = 'sprints'
export const SPRINT_ID_URL: string = ':sprintId'
export const SPRINT_WITH_ID_URL = SPRINT_ID_URL + '/' + SPRINT_ID_URL
// TASKS
export const TASKS_ID_URL: string = ':taskId'

export const viewTabs = {
  TABLE: 'table',
  GANTT: 'gantt',
  KANBAN: 'kanban',
  TREE: 'tree'
} as const
export type ViewTabs = (typeof viewTabs)[keyof typeof viewTabs]

// SETTINGS
export const SETTINGS_URL = 'settings'
export const settings = {
  APPEARANCE: 'appearance',
  SAFETY: 'safety',
  SUPPORT: 'support'
} as const

export const SETTINGS_APPEARANCE_URL: string = 'appearance'
export const SETTINGS_INTEGRATIONS_SAFETY: string = 'safety'
export const SETTINGS_SUPPORT: string = 'support'

// OPTIONS
export const optionProjectTabs = {
  GENERAL: 'general',
  PEOPLE: 'people',
  TAGS: 'tags'
} as const
export type OptionProjectTabs =
  (typeof optionProjectTabs)[keyof typeof optionProjectTabs]

export const optionWorkspaceTabs = {
  ADMINS: 'admins',
  SETTINGS: 'setting'
} as const
export type OptionWorkspaceTabs =
  (typeof optionWorkspaceTabs)[keyof typeof optionWorkspaceTabs]

export const PERMISSIONS_URL: string = ':userId/permissions'

// PROFILE
export const PROFILE_URL: string = 'profile'
export const PROFILE_ID_URL: string = ':profileId/:tab'

// NOTIFICATIONS
export const NOTIFICATIONS_URL: string = 'notifications'

// AUTH
export const AUTH_URL: string = 'auth'
export const REGISTER_URL: string = 'register'
export const LOGIN_URL: string = 'login'
export const ACTIVATION_ACCOUNT_URL: string = 'activate'
export const RESET_PASSWORD_URL: string = 'reset-password'

// OTHER
export const NOT_FOUND_URL: string = '/404'
export const SERVER_ERROR_URL: string = '/500'
export const INIT_URL: string = SPACE_URL + '/initialization'
export const REQUEST_URL: string = '/request'
export const VERIFY_URL: string = '/verify'
export const SET_URL: string = '/set'

// RESET
export const RESET_PASSWORD_REQUEST_URL: string =
  RESET_PASSWORD_URL + REQUEST_URL
export const RESET_PASSWORD_VERIFY_URL: string = RESET_PASSWORD_URL + VERIFY_URL
export const RESET_PASSWORD_SET_URL: string = RESET_PASSWORD_URL + SET_URL

export type RouterParams = {
  projectId?: string
  slugId?: string
  taskId?: string
  workspaceId?: string
  spaceId?: string
  profileId?: string
  folderId?: string
  sprintId?: string
}

// LEGAL
export const LEGAL_URL: string = '/legal'

export const legalTab = {
  CONSENT: 'consent',
  PERSONAL_DATA_POLICY: 'personal-data',
  PRIVACY_POLICY: 'privacy-policy',
  TERMS_OF_USE: 'terms-of-use',
  USER_AGREEMENT: 'user-agreement'
} as const

export type LegalTabs = (typeof legalTab)[keyof typeof legalTab]
