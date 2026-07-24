import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tag } from '@/widgets/Task/TaskProjectTag/ui/Tag/Tag'
import { TagCreate } from '@/widgets/Task/TaskProjectTag/ui/TagCreate/TagCreate'
import { TagList } from '@/widgets/Task/TaskProjectTag/ui/TagList/TagList'
import { ITag, Project } from '@/entities/Project'
import { CardSize } from '@/entities/TaskPlanner'
import { Plus } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Popover } from '@/shared/ui/Popover/Popover'

interface Props {
  tags: ITag[]
  handleDeleteTag: (tag: ITag) => void
  handleAddTag: (tag: ITag) => void
  activeProject: Project
  disabled?: boolean
  container?: Element | null
  triggerClassName?: string
  insideContainer?: boolean
  align?: 'start' | 'center' | 'end'
}

export type TagDropdownType = 'create' | 'view'

export const ProjectTags: FC<Props> = observer(
  ({
    tags,
    handleAddTag,
    handleDeleteTag,
    activeProject,
    disabled = false,
    container,
    triggerClassName,
    insideContainer = false,
    align
  }) => {
    const [showPopover, setShowPopover] = useState<boolean>(false)
    const [typeDropdown, setTypeDropdown] = useState<TagDropdownType>(
      activeProject.tags?.length === 0 ? 'create' : 'view'
    )
    const {
      taskPlanerStore: { cardSize }
    } = useRootStore()

    const isCardMedium = CardSize.medium === cardSize
    const { t } = useTranslation(ENTITY)

    const renderPopover = () => (
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <Popover.Trigger
          className={classNames(
            'iconContainer w-full flex items-center gap-1',
            triggerClassName
          )}
          disabled={disabled}
          data-ignore-click
        >
          <div>
            <Plus className='icon w-4 h-4' />
          </div>

          <p className={'body-12 secondaryText w-max'}>{t('tags.new')}</p>
        </Popover.Trigger>
        <Popover.Content
          className='w-[352px] h-[264px]'
          container={container}
          data-ignore-click
          align={align}
        >
          {typeDropdown === 'view' ? (
            <TagList
              tags={tags}
              activeProject={activeProject}
              handleAddTag={handleAddTag}
              handleDeleteTag={handleDeleteTag}
              setTypeDropdown={setTypeDropdown}
            />
          ) : (
            <TagCreate
              tags={tags}
              activeProject={activeProject}
              handleAddTag={handleAddTag}
              handleDeleteTag={handleDeleteTag}
              setTypeDropdown={setTypeDropdown}
              setShowPopover={setShowPopover}
            />
          )}
        </Popover.Content>
      </Popover>
    )

    const renderTags = () => {
      if (insideContainer && isCardMedium) {
        const visibleTags = tags.slice(0, 2)
        const remainingTagsCount = tags.length - visibleTags.length

        return (
          <>
            {visibleTags.map((tag) => (
              <Tag
                key={tag.id}
                tag={tag}
                handleDeleteTag={handleDeleteTag}
                disable={disabled}
              />
            ))}
            {remainingTagsCount > 0 && (
              <p className='body-14-16 rounded bg-hover p-2'>{`+${remainingTagsCount}`}</p>
            )}
          </>
        )
      }
      return tags.map((tag) => (
        <Tag
          key={tag.id}
          tag={tag}
          handleDeleteTag={handleDeleteTag}
          disable={disabled}
        />
      ))
    }

    return (
      <>
        {insideContainer ? (
          <div className='flex flex-wrap gap-1 w-full'>
            {!disabled && renderPopover()}
            {renderTags()}
          </div>
        ) : (
          <>
            {renderPopover()}
            {tags.length > 0 && (
              <div className='flex flex-wrap gap-1 w-full'>{renderTags()}</div>
            )}
          </>
        )}
      </>
    )
  }
)
