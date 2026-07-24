import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useEditableTitle } from '@/widgets/Task/TaskItem/BodyTaskItem/hooks/useEditableTitle'
import { CopyIcon, TitleContent } from '@/widgets/Task/TaskItem/BodyTaskItem/ui'
import { EditIcon } from '@/widgets/Task/TaskItem/BodyTaskItem/ui/icons/EditIcon/EditIcon'
import { useContentTaskItem } from '@/widgets/Task/TaskItem/ContentTaskItem/lib/useContentTaskItem'
import { TabsTaskItem } from '@/widgets/Task/TaskItem/TabsTaskItem/TabsTaskItem'
import { TAB } from '@/widgets/Task/TaskItem/TabsTaskItem/const/tab'
import { useTaskTabs } from '@/widgets/Task/TaskItem/hooks/useTaskTabs'
import { TaskAuthorInfo, usePermissionTask } from '@/entities/Task'
import { TaskFinished } from '@/shared/assets/images/icons'
import { StatusCodes } from '@/shared/const/statusCodes'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './BodyTaskItem.module.scss'


export const BodyTaskItem = observer(() => {
  const {
    taskStore: { activeTask }
  } = useRootStore()
  const { handleChangeTitle } = useContentTaskItem()
  const { canEditTitleTask } = usePermissionTask(activeTask)

  const {
    value,
    error,
    isEditing,
    cancelEditing,
    handleChange,
    save,
    startEditing
  } = useEditableTitle({
    initialValue: activeTask.title,
    onSave: handleChangeTitle
  })

  const { activeTab, setActiveTab } = useTaskTabs(activeTask)

  const isWithoutButton = activeTab !== TAB.DESCRIPTION

  const isExecuted = activeTask.status.code === StatusCodes.EXECUTED

  return (
    <div
      className={classNames(
        'w-[calc(100%-400px)] flex relative',
        isWithoutButton && 'h-[calc(100dvh-81px)] pb-[81px]'
      )}
    >
      <div className={classNames(styles.bodyTask, 'scrollbarContainerOnBg')}>
        <div className={styles.titleContainer}>
          {isExecuted && (
            <div className={'pt-1 flex-1'}>
              <TaskFinished className={'w-6 h-6'} />
            </div>
          )}
          <div className={styles.titleInfo}>
            <TitleContent
              value={value}
              error={error}
              isEditing={isEditing}
              cancelEditing={cancelEditing}
              handleChange={handleChange}
              save={save}
            />
            <TaskAuthorInfo task={activeTask} />
          </div>
          {!isExecuted && (
            <div className='flex gap-1'>
              {canEditTitleTask && (
                <EditIcon
                  isEditing={isEditing}
                  startEditing={startEditing}
                  cancelEditing={cancelEditing}
                />
              )}

              <CopyIcon />
            </div>
          )}
        </div>

        <TabsTaskItem onTabChange={setActiveTab} />
      </div>
    </div>
  )
})
