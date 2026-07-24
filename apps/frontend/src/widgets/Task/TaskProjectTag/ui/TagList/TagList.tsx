import classNames from 'classnames'
import { Dispatch, MouseEvent, SetStateAction } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { TagDropdownType } from '@/widgets/Project/ProjectTags/ProjectTags'
import { useInputSearch } from '@/features/Search/lib/hooks/useInputSearch'
import { ITag, Project } from '@/entities/Project'
import { Magnify, PlusCircle } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { useMap } from '@/shared/lib/hooks/useMapSet'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import { TagSelect } from '../TagSelect/TagSelect'
import styles from './TagList.module.scss'


interface Props {
  tags: ITag[]
  activeProject: Project
  handleDeleteTag: (tag: ITag) => void
  handleAddTag: (tag: ITag) => void
  setTypeDropdown: Dispatch<SetStateAction<TagDropdownType>>
}

export const TagList = ({
  tags,
  activeProject,
  handleDeleteTag,
  handleAddTag,
  setTypeDropdown
}: Props) => {
  const { t } = useTranslation(ENTITY)
  const { query, handleChangeInputSearch, filterItems } = useInputSearch<ITag>(
    activeProject.tags,
    ['name']
  )

  const tagMap = useMap<number, ITag>(
    tags.reduce((map, tag) => {
      map.set(tag.id, tag)
      return map
    }, new Map<number, ITag>())
  )

  const changeTag = (e: MouseEvent, tag: ITag) => {
    if (tagMap.has(tag.id)) {
      tagMap.delete(tag.id)
      return handleDeleteTag(tag)
    } else {
      tagMap.set(tag.id, tag)
      return handleAddTag(tag)
    }
  }

  return (
    <div className={styles.dropdown}>
      <Input
        label={''}
        placeholder={t('tags.searchByTags') as string}
        onChange={handleChangeInputSearch}
        value={query}
        EndIcon={Magnify}
      />
      <div
        className={classNames(
          'flex flex-col flex-1 overflow-y-auto',
          'scrollbarContainerOnObjects'
        )}
      >
        {filterItems.length ? (
          filterItems.map((tag) => (
            <TagSelect
              tagMap={tagMap}
              key={tag.id}
              tag={tag}
              changeTag={changeTag}
            />
          ))
        ) : (
          <div
            className={
              'w-full h-full flex justify-center items-center flex-col gap-1 text-center'
            }
          >
            <h3>{t('tags.noSuchTags')}</h3>{' '}
            <p className={'body-12'}>
              <Trans
                i18nKey='tags.noTagMessage'
                components={{ span: <span className='block' /> }}
              />
            </p>
          </div>
        )}
      </div>

      <Button
        styleButton={'filled'}
        onClick={() => setTypeDropdown('create')}
        icon={<PlusCircle className={'w-4 h-4 iconActive'} />}
      >
        <p className={'body-14-16'}>{t('project.tag.create')}</p>
      </Button>
    </div>
  )
}
