import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { TAB, TabKey } from '@/widgets/Task/TaskItem/TabsTaskItem/const/tab'
import { CommentSorting } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentSorting/CommentSorting'
import { FileView } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/FileView/FileView'
import { useTaskTabs } from '@/widgets/Task/TaskItem/hooks/useTaskTabs'
import { StatusCodes } from '@/shared/const/statusCodes'
import { ENTITY } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { Tabs } from '@/shared/ui/Tabs/Tabs'
import { LabelCounter } from './ui/LabelCounter/LabelCounter'


interface Props {
  onTabChange?: (tab: TabKey) => void
}

export const TabsTaskItem: FC<Props> = observer(({ onTabChange }) => {
  const {
    taskStore: { activeTask }
  } = useRootStore()
  const { t } = useTranslation([ENTITY])

  const {
    tabData,
    activeTab,
    setActiveTab,
    isShowFinishedTasks,
    setIsShowFinishedTasks,
    isSortDes,
    setIsSortDes,
    filesView,
    setFilesView
  } = useTaskTabs(activeTask)

  const hasFinishedTasks = activeTask.subtasks.some(
    (item) => item.status.code == StatusCodes.EXECUTED
  )

  const isShowCheckbox = hasFinishedTasks && activeTab === TAB.SUBTASKS

  const handleTabChange = (val: string) => {
    const tab = val as TabKey
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  const isShowFileView = activeTab === TAB.FILES && activeTask.files.length > 0

  const isShowCommentSorting =
    activeTab === TAB.COMMENTS && activeTask.comments.length > 1

  return (
    <Tabs
      defaultValue={activeTab}
      className={'flex flex-col gap-4 grow shrink-0 basis-0'}
      onValueChange={handleTabChange}
    >
      <div className={'flex w-full justify-between items-center flex-wrap'}>
        <Tabs.List className={'py-1'}>
          {tabData.map(({ value, label, count, disabled }) => (
            <Tabs.Trigger key={value} value={value} disabled={disabled}>
              <LabelCounter
                label={label}
                count={count && count > 0 ? count : undefined}
              />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {isShowCheckbox && (
          <Checkbox
            checked={isShowFinishedTasks}
            onCheckedChange={(checked) => {
              const isChecked = typeof checked === 'boolean' ? checked : false
              setIsShowFinishedTasks(isChecked)
              LocalStorageHelper.setIsShowFinishedTasks(isChecked)
            }}
            label={t('task.showCompleted', { ns: ENTITY })}
            classNameLabel={'body-14-20 w-max'}
          />
        )}
        {isShowFileView && (
          <FileView filesView={filesView} setFilesView={setFilesView} />
        )}
        {isShowCommentSorting && (
          <CommentSorting isSortDes={isSortDes} setIsSortDes={setIsSortDes} />
        )}
      </div>

      {tabData.map(({ value, component }) => (
        <Tabs.Content key={value} value={value}>
          {component}
        </Tabs.Content>
      ))}
    </Tabs>
  )
})
