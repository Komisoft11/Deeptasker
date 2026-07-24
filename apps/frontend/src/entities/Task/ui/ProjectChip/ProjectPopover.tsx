import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { FC, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useInputSearch } from '@/features/Search/lib/hooks/useInputSearch'
import { Project } from '@/entities/Project'
import { Task, useTasks } from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Input } from '@/shared/ui/Input/Input'
import { Popover } from '@/shared/ui/Popover/Popover'
import styles from './ProjectPopover.module.scss'


interface Props {
  disable?: boolean
  task: Task
  triggerClassName?: string
  contentClassName?: string
  selectedProject?: Project
}

export const ProjectPopover: FC<Props> = observer(
  ({ disable, task, triggerClassName, contentClassName, selectedProject }) => {
    return (
      <Popover>
        <Popover.Trigger
          disabled={disable}
          className={classNames(styles.trigger, triggerClassName)}
        >
          <p className={'body-12 ellipsis'}>
            {selectedProject ? selectedProject.title : task.project.title}
          </p>
        </Popover.Trigger>
        <Popover.Content align={'end'} className={contentClassName}>
          <ProjectDropdown
            task={task}
            selectedProject={selectedProject ?? undefined}
          />
        </Popover.Content>
      </Popover>
    )
  }
)

interface ProjectDropdownProps {
  task: Task
  selectedProject?: Project
}

const ProjectDropdown = ({ task, selectedProject }: ProjectDropdownProps) => {
  const {
    projectStore: { projects }
  } = useRootStore()
  const { changeProjectAsync } = useTasks()

  const changeProject = async (e: MouseEvent, changedProject: Project) => {
    e.preventDefault()
    e.stopPropagation()

    await changeProjectAsync.mutateAsync({
      task: task,
      mainProject: task.project,
      changedProject: changedProject
    })
  }
  const { t } = useTranslation()
  const { query, handleChangeInputSearch, filterItems } =
    useInputSearch<Project>(projects, ['title'])

  const shouldShowInput = query || filterItems.length > 5
  return (
    <div className={'flex flex-col gap-2'}>
      {shouldShowInput && (
        <Input
          placeholder={t<string>('project.title')}
          onChange={handleChangeInputSearch}
          value={query}
        />
      )}
      <div
        className={classNames(styles.dropdown, 'scrollbarContainerOnObjects')}
      >
        {filterItems.map((project) => (
          <div
            className={classNames(
              styles.item,
              selectedProject
                ? selectedProject.id === project.id && styles.active
                : task.projectId === project.id && styles.active
            )}
            key={project.id}
            onClick={(e) => changeProject(e, project)}
          >
            <p className={'body-14-16 ellipsis'}>{project.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
