import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { CreateTag } from '@/widgets/Project/ProjectDialogTabs/ProjectTagsTab/ui/CreateTag/CreateTag'
import { TagLayout } from '@/widgets/Project/ProjectDialogTabs/ProjectTagsTab/ui/TagLayout/TagLayout'
import { usePermissionProject } from '@/entities/Project'
import { Close, Plus } from '@/shared/assets/images/icons'
import { RouterParams } from '@/shared/config/route.config'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { CANCEL } from '@/shared/lib/helpers/shortcut.helper'
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { FooterButton } from '@/shared/ui/FooterButton/FooterButton'
import styles from './ProjectTagsTab.module.scss'


export const ProjectTagsTab: FC = observer(() => {
  const [isCreateTag, setIsCreateTag] = useState<boolean>(false)
  const { t } = useTranslation([ENTITY, TRANSLATION])
  const {
    permissions: { createTags }
  } = usePermissionProject()
  const { projectStore } = useRootStore()

  const { projectId } = useParams<RouterParams>()

  const project = projectStore.get(Number(projectId))

  useKeyDown(document, () => setIsCreateTag(false), [CANCEL])

  return (
    <>
      {project.tags.length === 0 && !isCreateTag ? (
        <p className={'w-full secondaryText body-12 text-center flex-1 px-4'}>
          {t('project.tag.tagsPlaceholder', { ns: ENTITY })}
        </p>
      ) : (
        <div className={classNames(styles.container, 'scrollbarContainerOnBg')}>
          {project.tags &&
            project.tags.map((tag) => (
              <TagLayout project={project} tag={tag} key={tag.id} />
            ))}
          {isCreateTag && (
            <CreateTag project={project} setIsCreateTag={setIsCreateTag} />
          )}
        </div>
      )}

      {createTags && (
        <FooterButton
          colorButton={'dark'}
          styleButton={'filled'}
          buttonText={
            isCreateTag
              ? t('cancel', { ns: TRANSLATION })
              : t('project.tag.create', { ns: ENTITY })
          }
          Icon={isCreateTag ? Close : Plus}
          onClick={() => setIsCreateTag(!isCreateTag)}
        />
      )}
    </>
  )
})
