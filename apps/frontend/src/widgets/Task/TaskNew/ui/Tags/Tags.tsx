import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { Controller } from 'react-hook-form'
import { Control } from 'react-hook-form/dist/types/form'
import { useTranslation } from 'react-i18next'
import { ProjectTags } from '@/widgets/Project'
import { TaskCreationData } from '@/widgets/Task/TaskNew/types/task-creation.interface'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import styles from './Tags.module.scss'


interface Props {
  control: Control<TaskCreationData, any>
}

export const Tags: FC<Props> = observer(({ control }) => {
  const {
    projectStore: { activeProject }
  } = useRootStore()

  const target = document.querySelector(
    '.radix-dialog-task-creation'
  ) as HTMLElement

  const { t } = useTranslation(ENTITY)

  return (
    <HorizontalLayout
      labelText={t('tags.title')}
      className={'w-fit'}
      containerClassName={classNames('pt-4 pb-4 border-none', styles.container)}
    >
      <div className={'flex gap-1 '}>
        <Controller
          control={control}
          name={'tags'}
          render={({ field: { onChange, value } }) => {
            return (
              <ProjectTags
                container={target}
                tags={value ?? []}
                triggerClassName={'h-max'}
                activeProject={activeProject}
                handleDeleteTag={(tag) =>
                  value && onChange(value.filter((t) => t.id !== tag.id))
                }
                align={'end'}
                handleAddTag={(tag) =>
                  value ? onChange([tag, ...value]) : onChange([tag])
                }
              />
            )
          }}
        />
      </div>
    </HorizontalLayout>
  )
})
