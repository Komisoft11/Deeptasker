import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ContentTaskItem } from '@/widgets/Task/TaskItem/ContentTaskItem/ContentTaskItem'
import { Files } from '@/widgets/Task/TaskItem/Files/Files'
import { SubtasksTaskItem } from '@/widgets/Task/TaskItem/SubtasksTaskItem/SubtasksTaskItem'
import { TAB, TabKey } from '@/widgets/Task/TaskItem/TabsTaskItem/const/tab'
import { TaskCommentTab } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/TaskCommentTab'
import { FileTab } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/FileTab/FileTab'
import { TimeTab } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/TimeTab'
import { Task, usePermissionTask } from '@/entities/Task'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'

export interface TabDataType {
  value: TabKey
  label: string
  count?: number
  disabled?: boolean
  component: ReactNode
}

export const useTaskTabs = (activeTask: Task) => {
  const { t } = useTranslation([TRANSLATION, ENTITY])
  const [isShowFinishedTasks, setIsShowFinishedTasks] = useState(
    LocalStorageHelper.getIsShowFinishedTasks()
  )
  const [isSortDes, setIsSortDes] = useState(true)
  const [filesView, setFilesView] = useState<'cards' | 'list'>('list')
  const { canEditDescriptionTask } = usePermissionTask(activeTask)

  const isFilesVisible = activeTask.files.length > 0
  const isShowDescription = canEditDescriptionTask || activeTask.content

  const tabData: TabDataType[] = [
    ...(isShowDescription
      ? [
          {
            value: TAB.DESCRIPTION,
            label: t<string>('task.info.description', { ns: ENTITY }),
            component: (
              <div className='flex flex-col gap-2 w-full h-full'>
                {isShowDescription && <ContentTaskItem />}
                {isFilesVisible && <Files files={activeTask.files} />}
              </div>
            )
          }
        ]
      : []),
    {
      value: TAB.SUBTASKS,
      label: t<string>('task.info.subtasks', { ns: ENTITY }),
      count: activeTask.subtasks.length,
      component: <SubtasksTaskItem isShowFinishedTasks={isShowFinishedTasks} />
    },
    {
      value: TAB.COMMENTS,
      label: t<string>('comments', { ns: TRANSLATION }),
      count: activeTask.commentsCount,
      component: <TaskCommentTab isSortDes={isSortDes} />
    },
    {
      value: TAB.FILES,
      label: t<string>('files', { ns: TRANSLATION }),
      count: activeTask.filesCount,
      component: <FileTab filesView={filesView} />
    },
    {
      value: TAB.TIME,
      label: t<string>('time', { ns: TRANSLATION }),
      disabled: false,
      component: <TimeTab />
    }
  ].filter(Boolean) as TabDataType[]

  const initialTab: TabKey = tabData[0]?.value || TAB.SUBTASKS
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  return {
    tabData,
    activeTab,
    setActiveTab,
    isShowFinishedTasks,
    setIsShowFinishedTasks,
    isSortDes,
    setIsSortDes,
    filesView,
    setFilesView
  }
}
