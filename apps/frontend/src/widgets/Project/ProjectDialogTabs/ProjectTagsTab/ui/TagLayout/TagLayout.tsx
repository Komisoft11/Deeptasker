import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ColorPicker } from '@/features/ColorPicker/ColorPicker'
import {
  ITag,
  ITagCreateDto,
  Project,
  usePermissionProject
} from '@/entities/Project'
import useProjects from '@/entities/Project/lib/hooks/useProjects'
import { tagCreateSchema } from '@/entities/Project/lib/tagSchema'
import { Trash } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { CANCEL } from '@/shared/lib/helpers/shortcut.helper'
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'
import { Popover } from '@/shared/ui/Popover/Popover'
import styles from './TagLayout.module.scss'


interface TagLayoutProps {
  project: Project
  tag: ITag
}

export const TagLayout: FC<TagLayoutProps> = observer(({ tag, project }) => {
  const { deleteTagAsync, changeTagAsync } = useProjects()
  const { isTagTitleExist } = useProjects()
  const {
    permissions: { updateTags }
  } = usePermissionProject()

  const { t } = useTranslation(ENTITY)

  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    getValues,
    reset
  } = useForm<ITagCreateDto>({
    mode: 'onChange',
    defaultValues: {
      projectId: project.id,
      name: tag.name,
      colorBg: '#8F68FF'
    },
    resolver: yupResolver(
      tagCreateSchema(function (value: string) {
        return value ? !isTagTitleExist(value) : true
      })
    )
  })

  const handleEnter = async () => {
    await handleChangeTag(getValues('name'))
    reset({ name: getValues('name') })
    setIsEdit(false)
  }

  const handleBlur = async () => {
    if (isDirty && isValid) {
      await handleChangeTag(getValues('name'))
      reset({ name: getValues('name') })
    } else {
      reset()
    }
    setIsEdit(false)
  }

  useKeyDown(ref, () => reset(), [CANCEL])

  const handleChangeTag = async (name: string) => {
    await changeTagAsync.mutateAsync({
      projectId: project.id,
      tagId: tag.id,
      dto: { ...tag, name }
    })
  }

  const changeColor = async (color: string) => {
    await changeTagAsync.mutateAsync({
      projectId: project.id,
      tagId: tag.id,
      dto: {
        ...tag,
        colorBg: color
      }
    })
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
  }

  const isEditMode = (isEdit || open) && updateTags

  useEffect(() => {
    reset({
      projectId: project.id,
      name: tag.name,
      colorBg: tag.colorBg
    })
  }, [tag.name, tag.colorBg])

  return (
    <div className={styles.tagDetails} ref={ref}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <Popover.Anchor className={'w-full'}>
          <form
            className={classNames(
              styles.inputContainer,
              isEditMode && styles.editMode,
              errors.name && 'border-systemRed'
            )}
            onSubmit={handleSubmit(handleEnter)}
            onBlur={handleBlur}
            key={tag.id + ':' + tag.name}
          >
            <div className={'flex gap-1 items-center h-full w-full'}>
              <Popover.Trigger disabled={!updateTags}>
                <div
                  className={classNames(
                    styles.tagColor,
                    !updateTags && styles.readonly
                  )}
                  style={{ backgroundColor: tag.colorBg }}
                ></div>
              </Popover.Trigger>

              <Input
                maxLength={13}
                autoComplete={'off'}
                placeholder={t('project.tag.enterName') as string}
                className={classNames(
                  styles.input,
                  !updateTags && styles.readonly
                )}
                {...register('name')}
                onInput={() => setIsEdit(true)}
                onBlur={() => setIsEdit(false)}
                disabled={!updateTags}
                containerClassName={'focus-within:!outline-none'}
              />
              {isEdit && (
                <KbdElement kdb={'Enter'} tooltipContent={'Добавить тег'} />
              )}
            </div>

            {updateTags && (
              <Button
                styleButton={'filled'}
                colorButton={'dark'}
                className={styles.button}
                onClick={async () => {
                  await deleteTagAsync.mutateAsync({
                    projectId: project.id,
                    tagId: tag.id
                  })
                }}
              >
                <Trash className={styles.icon} />
              </Button>
            )}
          </form>
          {errors.name && (
            <p
              className={
                'text-systemRed body-12 py-2 text-center absolute right-1/2'
              }
            >
              {errors.name?.message}
            </p>
          )}
        </Popover.Anchor>
        <Popover.Content align={'start'}>
          <ColorPicker
            isForTags={true}
            initialColor={tag.colorBg}
            classNamePalette={styles.colorContainer}
            setColor={(color) => changeColor(color)}
          />
        </Popover.Content>
      </Popover>
    </div>
  )
})