import { mergeQueryKeys } from '@lukemorales/query-key-factory'
import { commentQueries } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/api/comment'
import { timeHistoryQueries } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/api/timeHistoryQueries'
import { notificationQueries } from '@/entities/Notifications/api/notification'
import { projectsQueries } from '@/entities/Project'
import { reportsQueries } from '@/entities/Report'
import { usersQueries as users } from '@/entities/User'
import { workspaceQueries } from '@/entities/Workspace/api/workspace'


export const queries = mergeQueryKeys(
  users,
  projectsQueries,
  workspaceQueries,
  notificationQueries,
  timeHistoryQueries,
  commentQueries,
  reportsQueries
)
