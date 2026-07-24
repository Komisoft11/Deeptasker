import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectsFilter } from '@/widgets/Project/ProjectSidebar/hooks/useProjectsFilter'
import { ProjectItem } from '@/features/Project'
import { nsObject } from '@/shared/lib/helpers/translation.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './ProjectList.module.scss'


export const ProjectList = observer(() => {
  const {
    projectStore: { projects, activeProject }
  } = useRootStore()

  const baseFilter = useProjectsFilter()
  const filteredProjects = baseFilter(projects)
  const { t } = useTranslation()

  if (!projects.length) {
    return (
      <div className={styles.empty}>
        <h4>{t('project.error.empty')}</h4>
        <p className={'body-12 secondaryText'}>
          {t('project.error.createProject')}
        </p>
      </div>
    )
  }

  if (!filteredProjects.length) {
    return (
      <div className={styles.empty}>
        <p className='body-14-16 secondaryText'>
          {t('sorryNothingFound', nsObject())}
        </p>
      </div>
    )
  }

  return (
    <ul className={classNames(styles.list, 'scrollbarContainerOnBg')}>
      {filteredProjects.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          isActive={activeProject?.id === project.id}
        />
      ))}
    </ul>
  )
})
