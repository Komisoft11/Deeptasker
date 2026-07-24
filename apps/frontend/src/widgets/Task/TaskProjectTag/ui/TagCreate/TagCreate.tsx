import classNames from 'classnames'
import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { TagDropdownType } from '@/widgets/Project/ProjectTags/ProjectTags'
import { TagSelect } from '@/widgets/Task/TaskProjectTag/ui/TagSelect/TagSelect'
import { ColorPicker } from '@/features/ColorPicker/ColorPicker'
import { Project } from '@/entities/Project'
import useProjects from '@/entities/Project/lib/hooks/useProjects'
import {
  ITag,
  ITagCreateDto
} from '@/entities/Project/model/types/project.interface'
import { Close } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import styles from './TagCreate.module.scss'


interface Props {
  tags: ITag[]
  activeProject: Project
  handleDeleteTag: (tag: ITag) => void
  handleAddTag: (tag: ITag) => void
  setTypeDropdown: Dispatch<SetStateAction<TagDropdownType>>
  setShowPopover: (showPopover: boolean) => void
}

export const TagCreate = ({
  tags,
  activeProject,
  handleAddTag,
  handleDeleteTag,
  setTypeDropdown,
  setShowPopover
}: Props) => {
  const { t } = useTranslation([ENTITY, TRANSLATION])
  const { createTagAsync } = useProjects()

  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState('')
  const [tagExists, setTagExists] = useState(false)
  const [colorError, setColorError] = useState(false)
  const [nameError, setNameError] = useState('')

  const existingTags = activeProject.tags

  const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTagName(e.target.value)
    setTagExists(existingTags.some((tag) => tag.name === e.target.value))
  }

  const changeTag = (e: MouseEvent, tag: ITag) => {
    e.stopPropagation()
    e.preventDefault()

    setShowPopover(false)

    if (tagMap.has(tag.id)) {
      tagMap.delete(tag.id)
      return handleDeleteTag(tag)
    } else {
      tagMap.set(tag.id, tag)
      return handleAddTag(tag)
    }
  }

  const tagMap = new Map<number, ITag>(tags.map((tag) => [tag.id, tag]))

  const handleCreateTag = async () => {
    if (!tagColor) {
      setColorError(true)
      return
    }
    setColorError(false)

    const dto: ITagCreateDto = {
      name: tagName,
      colorBg: tagColor,
      projectId: activeProject.id
    }

    await createTagAsync.mutateAsync(dto)

    goToView()
  }

  const goToView = () => {
    setTypeDropdown('view')
    setTagName('')
    setTagColor('')
    setNameError('')
    setColorError(false)
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await handleCreateTag()
      }}
      className={'relative flex flex-col justify-between h-full'}
    >
      <Close
        className={'icon w-4 h-4 absolute right-0 top-0'}
        onClick={goToView}
      />
      <div className={'flex flex-col gap-4 w-full'}>
        <Input
          label={''}
          autoFocus
          maxLength={13}
          placeholder={t('project.tag.enterName', { ns: ENTITY }) as string}
          value={tagName}
          onChange={handleTagChange}
          className={classNames(
            styles.input,
            (nameError || tagExists) && styles.errors
          )}
          error={!!nameError}
          containerClassName={'focus-within:!outline-none'}
          helperText={nameError}
        />
        {!tagExists ? (
          <ColorPicker
            initialColor={tagColor}
            buttonClassName={'w-[46px]'}
            setColor={(color) => {
              setTagColor(color)
              setColorError(false)
            }}
            classNamePalette={'w-full p-0'}
          />
        ) : (
          <TagSelect
            tag={existingTags.find((tag) => tag.name === tagName)!}
            changeTag={changeTag}
            tagMap={tagMap}
          />
        )}

        {tagExists && (
          <p className={'w-full text-center body-14-16 text-systemRed'}>
            Такой тег уже существует, хотите использовать его?
          </p>
        )}
        {colorError && (
          <p className={'w-full text-center body-14-16 text-systemRed'}>
            Пожалуйста, выберите цвет для тега.
          </p>
        )}
      </div>

      <Button
        styleButton={'filled'}
        type='button'
        disabled={tagExists || !tagName}
        className={'w-[140px] max-h-10 body-14-16'}
        onClick={handleCreateTag}
      >
        {t('create', { ns: TRANSLATION })}
      </Button>
    </form>
  )
}
