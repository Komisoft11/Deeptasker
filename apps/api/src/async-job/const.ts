export enum ProjectImportType {
  trello = 'trello'
}

export const Queues = {
  TRELLO_QUEUE: 'trello-queue',
  EMAIL_QUEUE: 'email-queue',
  PROJECT_ORDER_QUEUE: 'project-order-queue',
  TASK_ORDER_QUEUE: 'task-order-queue',
  REPORT_QUEUE: 'report-queue'
}

export const ProjectJobs = {
  PROJECT_ORDER_JOB: 'project-order-job'
}

export const TaskJobs = {
  TASK_ORDER_JOB: 'task-order-job'
}

export const TrelloJobs = {
  PROJECT_IMPORT_JOB: 'trello-import-job'
}

export const ReportJobs = {
  TASK_REPORT_JOB: 'task-report-job'
}
