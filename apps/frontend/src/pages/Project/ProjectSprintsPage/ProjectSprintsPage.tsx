import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, SVGProps, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import { NewSprintDialog } from '@/pages/Project/ProjectSprintsPage/NewSprintDialog/NewSprintDialog'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { usePermissionProject } from '@/entities/Project'
import { useSprints } from '@/entities/Sprint/lib/hooks/useSprints'
import { Sprint } from '@/entities/Sprint/model/sprint'
import { SprintStatuses } from '@/entities/Sprint/model/types/sprint.types'
import { CaretDown, Edit, Plus, Trash } from '@/shared/assets/images/icons'
import { Active, Ended, Future } from '@/shared/assets/images/icons/sprints'
import { ENTITY } from '@/shared/const/translation'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { SprintsNavigator } from '@/shared/lib/navigators/sprints.navigator'
import { Accordion } from '@/shared/ui/Accordion/Accordion'
import { Button } from '@/shared/ui/Button/Button'
import { Header } from '@/shared/ui/Header/Header'
import { ProgressBar } from '@/shared/ui/ProgressBar/ProgressBar'
import styles from './ProjectSprintsPage.module.scss'


export const ProjectSprintsPage = observer(() => {
  const { t } = useTranslation(ENTITY)

  const {
    workspaceStore: { activeWorkspace },
    projectStore: { activeProject },
    folderStore: { activeFolder },
    sprintStore
  } = useRootStore()

  const {
    permissions: { createSprints }
  } = usePermissionProject()

  const { view } = useCurrentView()

  const [params] = useSearchParams()
  const [isAddSprint, setIsAddSprint] = useState(false)

  const backUrl = ProjectsNavigator.getExistProjectUrl({
    currentWorkspaceId: activeWorkspace.id,
    projectSlug: activeProject.slug,
    folderId: activeFolder?.id,
    view,
    params
  })

  const [isExpanded, setIsExpanded] = useState<string | undefined>(
    SprintStatuses.Active
  )

  const handleAccordionChange = (value: string | undefined) => {
    setIsExpanded(value)
  }

  return (
    <>
      <Header title={t('sprints.title')} navigateUrlToBack={backUrl} />
      <div className={'flex flex-col h-[calc(100%-73px)]'}>
        <Accordion
          value={isExpanded}
          onValueChange={handleAccordionChange}
          type='single'
          className='flex flex-col p-4 gap-3 flex-1 overflow-y-auto scrollbarContainerOnBg'
        >
          <AccordionItem
            value={SprintStatuses.Active}
            title={t('sprints.activeSprints')}
            sprints={sprintStore.activeSprints}
            isExpanded={isExpanded === SprintStatuses.Active}
            Icon={Active}
          />
          <AccordionItem
            value={SprintStatuses.Planned}
            title={t('sprints.plannedSprints')}
            sprints={sprintStore.futureSprints}
            isExpanded={isExpanded === SprintStatuses.Planned}
            Icon={Future}
          />
          <AccordionItem
            value={SprintStatuses.Completed}
            title={t('sprints.completedSprints')}
            sprints={sprintStore.completedSprints}
            isExpanded={isExpanded === SprintStatuses.Completed}
            Icon={Ended}
          />
        </Accordion>
        {createSprints && (
          <div
            className={
              'p-4 border-t border-border flex items-center justify-center'
            }
          >
            <Button
              styleButton={'filled'}
              icon={<Plus />}
              className={'px-4 body-16'}
              onClick={() => setIsAddSprint(true)}
            >
              {t('sprints.addSprint')}
            </Button>
          </div>
        )}
      </div>
      {isAddSprint && (
        <NewSprintDialog
          isAddSprint={isAddSprint}
          setIsAddSprint={setIsAddSprint}
        />
      )}
    </>
  )
})

interface AccordionTriggerProps {
  title: string
  isExpanded: boolean
  Icon: FC<SVGProps<SVGSVGElement>>
  sprints: Sprint[]
}

const AccordionTriggerItem = ({
  isExpanded,
  Icon,
  sprints,
  title
}: AccordionTriggerProps) => {
  const totalTasks = sprints.reduce(
    (sum, sprint) => sum + sprint.tasks.length,
    0
  )
  const completedTasks = sprints.reduce(
    (sum, sprint) =>
      sum + sprint.tasks.filter((task) => task.dateFinished).length,
    0
  )

  const isSprintsExists = sprints.length > 0
  const isTasksExists = totalTasks > 0

  return (
    <Accordion.Trigger className={classNames(styles.trigger)}>
      <div className={'flex gap-6 w-full items-center'}>
        <div className={'flex gap-2 items-center'}>
          <div className={'flex gap-1 items-center w-full'}>
            <Icon className={'w-5 h-5'} />
            <h3 className={'w-max'}>{title}</h3>
          </div>
          {isSprintsExists && (
            <p className={'px-2 py-1 bg-hover body-12 rounded'}>
              {sprints.length}
            </p>
          )}
        </div>
        {isExpanded && isTasksExists && (
          <ProgressBar showPercentage max={totalTasks} value={completedTasks} />
        )}
      </div>

      <CaretDown
        className={classNames('icon', isExpanded ? 'rotate-180' : '')}
      />
    </Accordion.Trigger>
  )
}
const AccordionContentItem = observer(({ sprints }: { sprints: Sprint[] }) => {
  const {
    workspaceStore: { activeWorkspace },
    projectStore: { activeProject }
  } = useRootStore()
  const { deleteAsync } = useSprints()
  const navigate = useNavigate()
  const { t } = useTranslation(ENTITY)

  const {
    permissions: { deleteSprints, updateSprints }
  } = usePermissionProject()

  if (sprints.length === 0) {
    return (
      <Accordion.Content className={styles.content}>
        <p className='p-3 body-16 secondaryText'>{t('sprints.noData')}</p>
      </Accordion.Content>
    )
  }

  const handleDelete = async (
    e: React.MouseEvent<HTMLDivElement>,
    id: number
  ) => {
    e.stopPropagation()
    await deleteAsync.mutateAsync({ id })
  }

  return (
    <Accordion.Content className={styles.content}>
      {sprints.map(({ id, title, dateStart, dateEnd, tasks }) => (
        <div
          key={id}
          className={classNames(styles.contentItem, 'body-14-16')}
          onClick={() => {
            navigate(
              SprintsNavigator.getSprintIdUrl({
                currentWorkspaceId: activeWorkspace.id,
                sprintId: id,
                projectSlug: activeProject.slug
              })
            )
          }}
        >
          <p className='p-3 max-w-[80%] ellipsis'>{title}</p>
          <p className='p-3'>
            {`${formatDateTime({ date: dateStart, includeTime: false })} - 
              ${formatDateTime({ date: dateEnd, includeTime: false })}`}
          </p>
          <p className='p-3'>
            {tasks.length > 0
              ? t('task.tasksCount', { count: tasks.length })
              : t('sprints.noTasks')}
          </p>
          <div className={'flex gap-1'}>
            {updateSprints && (
              <div className='iconContainer h-max'>
                <Edit className='icon w-4 h-4' />
              </div>
            )}

            {deleteSprints && (
              <div
                className={'iconContainer h-max'}
                onClick={async (e) => {
                  await handleDelete(e, id)
                }}
              >
                <Trash className={'iconRed w-4 h-4'} />
              </div>
            )}
          </div>
        </div>
      ))}
    </Accordion.Content>
  )
})

interface AccordionItemProps {
  value: string
  title: string
  sprints: Sprint[]
  isExpanded: boolean
  Icon: FC<SVGProps<SVGSVGElement>>
}

const AccordionItem = ({
  value,
  title,
  sprints,
  isExpanded,
  Icon
}: AccordionItemProps) => (
  <Accordion.Item value={value} className='border border-border rounded-lg'>
    <AccordionTriggerItem
      title={title}
      isExpanded={isExpanded}
      Icon={Icon}
      sprints={sprints}
    />
    <AccordionContentItem sprints={sprints} />
  </Accordion.Item>
)
