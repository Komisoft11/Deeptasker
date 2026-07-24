import {
  DragOverlay,
  DropAnimation,
  Modifier,
  defaultDropAnimation
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FolderList } from '@/widgets/Folder/FolderList/FolderList'
import { getColumns } from '@/widgets/Task/TaskTable/lib/getColumns/getColumns'
import { SortableItem } from '@/widgets/Task/TaskTable/ui/SortableItem/SortableItem'
import { SearchResultList } from '@/features/Search/SearchResultList/SearchResultList'
import {
  Direction,
  SorterType,
  useSortView
} from '@/features/Sorting/lib/hooks/useSortView'
import { Folder, useFilterFolderFn } from '@/entities/Folder'
import { SECOND_CREATION_STEP } from '@/entities/Guidance'
import { usePermissionProject } from '@/entities/Project'
import { AddTaskInput } from '@/entities/Task'
import { useTaskFolderContext } from '@/entities/Task/context/TaskFolderContext'
import { SortAsc, SortDesc } from '@/shared/assets/images/icons'
import { viewTabs } from '@/shared/config/route.config'
import { StatusCodes } from '@/shared/const/statusCodes'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { CANCEL } from '@/shared/lib/helpers/shortcut.helper'
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { DropdownMenu } from '@/shared/ui/DropdownMenu/DropdownMenu'
import { Table } from '@/shared/ui/Table/Table'
import styles from './TaskTable.module.scss'

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5
        })
      }
    ]
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing
    })
  }
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25
  }
}

const sortOptions = [
  { type: SorterType.Default, label: 'sortItems.default' },
  { type: SorterType.Priority, label: 'sortItems.priority' },
  { type: SorterType.DateCreated, label: 'sortItems.dateCreated' },
  { type: SorterType.DateDeadline, label: 'sortItems.dateDeadline' }
]

export const TaskTable = observer(() => {
  const [isShowFinishedTasks, setIsShowFinishedTasks] = useState(
    LocalStorageHelper.getIsShowFinishedTasks()
  )
  const {
    taskStore,
    sidebarStore: { isExtendedTable },
    projectStore,
    folderStore,
    taskFilterStore,
    folderFilterStore,
    taskPlanerStore
  } = useRootStore()

  const isSearching: boolean = !!(
    taskFilterStore.queryTask.length || folderFilterStore.queryFolder.length
  )

  const {
    permissions: { createTasks: canCreateTask }
  } = usePermissionProject(projectStore.activeProject)

  const baseFiletAndSortFn = useFilterFolderFn()

  const folders: Folder[] = baseFiletAndSortFn(
    folderStore.activeFolder
      ? folderStore.activeFolder.subFolders
      : folderStore.rootFolders
  )

  const {
    sorter,
    isDefaultSorter,
    sorterDirection,
    handleSorterChange,
    handleChangeSortDirection
  } = useSortView()

  const { t } = useTranslation([TRANSLATION, ENTITY])

  const { activeId, projected, flattenedItems, sortedIds } =
    useTaskFolderContext()

  const visibleTasks = isShowFinishedTasks
    ? flattenedItems
    : flattenedItems.filter((item) => item.status.code !== StatusCodes.EXECUTED)

  const hasFinishedTasks = taskStore.tasks.some(
    (item) => item.status.code === StatusCodes.EXECUTED
  )
  const {
    permissions: { deleteTasks, createTasks, createFolders }
  } = usePermissionProject()

  const canUseActions: boolean = deleteTasks || createTasks

  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null)

  const activeTask = activeId ? taskStore.get(activeId) : undefined

  const columns = getColumns()
  const isInputHidden = !canCreateTask && visibleTasks.length === 0
  const shouldShowFolders = folders.length > 0 || createFolders

  useKeyDown(
    document,
    () => {
      setCurrentTaskId(null)
    },
    [CANCEL]
  )

  useEffect(() => {
    taskPlanerStore.view = viewTabs.TABLE
  }, [])

  if (isSearching) {
    return <SearchResultList />
  }

  return (
    <>
      {shouldShowFolders && <FolderList className={'mb-4'} />}
      <div className='w-full h-full overflow-hidden flex flex-col gap-3'>
        <div className={'w-full flex justify-between items-end'}>
          <div className={'w-full flex items-end gap-3'}>
            {!isInputHidden && (
              <AddTaskInput
                id={SECOND_CREATION_STEP}
                label={t('task.quickAddTask', { ns: ENTITY }) as string}
                className={'w-full max-w-[50%] ml-[1px]'}
                disabled={!canCreateTask}
              />
            )}
            {visibleTasks.length > 1 && (
              <DropdownMenu>
                <div className={styles.sorter}>
                  <DropdownMenu.Trigger
                    className={classNames(
                      styles.trigger,
                      !isDefaultSorter && 'bg-objects'
                    )}
                  >
                    <p className='body-14-16'>
                      {sorter === 'default'
                        ? t('sortItems.label')
                        : t(`sortItems.${sorter}`)}
                    </p>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    className='flex flex-col gap-2 min-w-[200px]'
                    sideOffset={12}
                  >
                    {sortOptions.map(({ type, label }) => (
                      <DropdownMenu.Item
                        key={type}
                        className={classNames(
                          styles.item,
                          'body-14-16',
                          sorter === type && styles.active
                        )}
                        onClick={() => handleSorterChange(type)}
                      >
                        <p>{t(label)}</p>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                  {!isDefaultSorter && (
                    <div
                      className={classNames(
                        styles.icon,
                        sorterDirection === Direction.Asc && 'bg-objects'
                      )}
                      onClick={handleChangeSortDirection}
                    >
                      {sorterDirection === Direction.Asc ? (
                        <SortAsc className='icon' />
                      ) : (
                        <SortDesc className='icon' />
                      )}
                    </div>
                  )}
                </div>
              </DropdownMenu>
            )}
          </div>
          {hasFinishedTasks && (
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
        </div>

        {!visibleTasks.length ? (
          <div className={styles.table}>
            <p className={'body-12 secondaryText w-full text-center pt-4'}>
              {t('task.error.empty', { ns: ENTITY })}
            </p>
          </div>
        ) : (
          <>
            <Table
              className={styles.table}
              data-is-actions={canUseActions}
              data-is-extended={isExtendedTable ? 'true' : 'false'}
            >
              <Table.Head className={'pr-[10px]'}>
                <Table.Row className={styles.header}>
                  {columns.map((column) => (
                    <Table.Cell
                      style={{
                        position: 'relative'
                      }}
                      key={column.id}
                      className={classNames(styles.cell, 'body-14-16')}
                      data-cell={column.id}
                    >
                      {column.header()}
                    </Table.Cell>
                  ))}
                </Table.Row>
              </Table.Head>
              <Table.Body className={styles.list}>
                <SortableContext
                  items={sortedIds}
                  strategy={verticalListSortingStrategy}
                >
                  {visibleTasks.map((flattenedItem) => (
                    <SortableItem
                      key={flattenedItem.id}
                      task={flattenedItem}
                      depth={
                        flattenedItem.id === activeId && projected
                          ? projected.depth
                          : flattenedItem.depth
                      }
                      parentId={projected?.parentId ?? undefined}
                      currentTaskId={currentTaskId}
                      setCurrentTaskId={setCurrentTaskId}
                    />
                  ))}
                </SortableContext>
              </Table.Body>
            </Table>
            {createPortal(
              <DragOverlay
                dropAnimation={dropAnimationConfig}
                modifiers={[adjustTranslate]}
              >
                {activeTask && (
                  <SortableItem
                    key={activeTask.id}
                    task={activeTask}
                    depth={activeTask.depth}
                    clone
                  />
                )}
              </DragOverlay>,
              document.body
            )}
          </>
        )}
      </div>
    </>
  )
})
