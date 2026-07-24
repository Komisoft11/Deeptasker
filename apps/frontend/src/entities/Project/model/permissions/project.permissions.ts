import { IPermissionProject, ProjectRole } from '@/entities/Project'

export const basePermissions: IPermissionProject = {
  //Папки
  listFolders: true,
  createFolders: false,
  editFolders: false,
  deleteFolders: false,

  //Задачи
  listTasks: true,
  openTasks: true,
  createTasks: false,
  deleteTasks: false,
  moveTasks: false,

  changeTaskAssigner: false,
  changeTaskExecutor: false,
  manageTaskObservers: false,

  editTaskTitle: false,
  editTaskDescription: false,
  editTaskDeadline: false,
  editTaskStatus: false,
  editTaskPriority: false,
  editTaskTags: false,
  editTaskTracking: false,

  deleteTaskComments: false,
  deleteTaskFile: false,

  executeTask: false,
  confirmExecuteTask: false,

  // Спринты
  listSprints: true,
  createSprints: false,
  updateSprints: false,
  deleteSprints: false,

  //Отчёты
  listReports: false,
  generateReports: false,
  deleteReports: false,

  //Пользователи и админы
  addUsers: false,
  removeUsers: false,
  manageAdmins: false,

  // Общие права
  edit: false,
  delete: false,

  // Теги
  createTags: false,
  updateTags: false,
  deleteTags: false
}

const guest: IPermissionProject = { ...basePermissions }

export const user: IPermissionProject = {
  ...guest,
  createTasks: true,
  createFolders: true,
  createTags: true,
  updateTags: true,
  deleteTags: true
}

const assigner: IPermissionProject = {
  ...user,
  editFolders: true,
  deleteFolders: true,
  moveTasks: true,
  changeTaskAssigner: true,
  changeTaskExecutor: true,
  deleteTaskFile: true,
  manageTaskObservers: true,
  editTaskDeadline: true,
  editTaskDescription: true,
  editTaskPriority: true,
  editTaskStatus: true,
  editTaskTags: true,
  editTaskTitle: true,
  updateSprints: true,
  deleteSprints: true,
  createSprints: true,
  listReports: true
}

const controller: IPermissionProject = {
  ...user,
  generateReports: true,
  removeUsers: true,
  moveTasks: true,
  deleteTasks: true,
  confirmExecuteTask: true,
  deleteTaskFile: true,
  manageTaskObservers: true,
  deleteTaskComments: true,
  editTaskStatus: true,
  editTaskTracking: true,
  listReports: true,
  deleteReports: true
}

function allTrue<T extends object>(template: T): { [K in keyof T]: true } {
  return Object.fromEntries(Object.keys(template).map((k) => [k, true])) as {
    [K in keyof T]: true
  }
}

const admin: IPermissionProject = {
  ...allTrue(basePermissions)
}

export const defaultProjectRolesPermissions: Record<
  ProjectRole,
  IPermissionProject
> = {
  guest,
  user,
  assigner,
  controller,
  admin
}

const permissionDescriptions: Record<keyof IPermissionProject, string> = {
  // Папки
  listFolders: 'listFolders',
  createFolders: 'createFolders',
  editFolders: 'editFolders',
  deleteFolders: 'deleteFolders',

  // Задачи
  listTasks: 'listTasks',
  openTasks: 'openTasks',
  createTasks: 'createTasks',
  deleteTasks: 'deleteTasks',
  moveTasks: 'moveTasks',
  changeTaskAssigner: 'changeTaskAssigner',
  changeTaskExecutor: 'changeTaskExecutor',
  manageTaskObservers: 'manageTaskObservers',
  editTaskTitle: 'editTaskTitle',
  editTaskDescription: 'editTaskDescription',
  editTaskDeadline: 'editTaskDeadline',
  editTaskStatus: 'editTaskStatus',
  editTaskPriority: 'editTaskPriority',
  editTaskTags: 'editTaskTags',
  editTaskTracking: 'editTaskTracking',
  deleteTaskComments: 'deleteTaskComments',
  deleteTaskFile: 'deleteTaskFile',
  executeTask: 'executeTask',
  confirmExecuteTask: 'confirmExecuteTask',

  // Спринты
  listSprints: 'listSprints',
  createSprints: 'createSprints',
  updateSprints: 'updateSprints',
  deleteSprints: 'deleteSprints',

  // Отчёты
  listReports: 'listReports',
  generateReports: 'generateReports',
  deleteReports: 'deleteReports',

  // Пользователи и админы
  addUsers: 'addUsers',
  removeUsers: 'removeUsers',
  manageAdmins: 'manageAdmins',

  // Теги
  createTags: 'createTags',
  updateTags: 'updateTags',
  deleteTags: 'deleteTags',

  // Общие права
  edit: 'edit',
  delete: 'delete'
}

export function getPermissionDescription(
  name: keyof IPermissionProject
): string {
  return permissionDescriptions[name] ?? name
}