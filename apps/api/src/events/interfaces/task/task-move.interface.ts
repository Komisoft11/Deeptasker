export interface ITaskMoveEvent {
  folder?: {
    change?: {
      newFolderId: number
    }
    remove?: {
      folderId: number
    }
  }
  task?: {
    change?: {
      newTaskId: number
      oldTaskId?: number
    }
    remove?: {
      parentId: number
    }
  }
}