import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import { useState } from 'react'
import { useController, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ColorPicker } from '@/features/ColorPicker/ColorPicker'
import { ITagCreateDto, Project } from '@/entities/Project'
import useProjects from '@/entities/Project/lib/hooks/useProjects'
import { tagCreateSchema } from '@/entities/Project/lib/tagSchema'
import { ENTITY } from '@/shared/const/translation'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'
import styles from './CreateTag.module.scss'


interface Props {
  project: Project
  setIsCreateTag: (createTag: boolean) => void
}

export const CreateTag = ({ project, setIsCreateTag }: Props) => {
  const { createTagAsync, isTagTitleExist } = useProjects()
  const [selectedColor, setSelectedColor] = useState('#8F68FF')
  const { t } = useTranslation(ENTITY)

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
    control,
    getValues,
    reset
  } = useForm<ITagCreateDto>({
    mode: 'onChange',
    defaultValues: {
      projectId: project.id,
      colorBg: '#8F68FF'
    },
    resolver: yupResolver(
      tagCreateSchema(function (value: string) {
        if (value) {
          return !isTagTitleExist(value)
        }
        return true
      })
    )
  })

  const handleCreateTag = async (dto: ITagCreateDto) => {
    await createTagAsync.mutateAsync(dto)
    setIsCreateTag(false)
    reset({ name: getValues('name') })
  }

  const {
    field: { ref, ...field }
  } = useController<ITagCreateDto>({
    control,
    name: 'colorBg'
  })

  return (
    <form
      className={styles.tagAddForm}
      onSubmit={handleSubmit(handleCreateTag)}
    >
      <div className={styles.tagContainer}>
        <div
          className={classNames(
            styles.inputContainer,
            errors.name && styles.borderSystemRed
          )}
        >
          <div
            className={styles.tagColor}
            style={{ backgroundColor: selectedColor }}
          ></div>
          <Input
            autoFocus={true}
            maxLength={13}
            autoComplete={'off'}
            {...register('name')}
            placeholder={t('project.tag.enterName') as string}
            className={styles.input}
            containerClassName={'focus-within:!outline-none'}
          />
          <div className={'flex gap-1'}>
            <KbdElement
              kdb={'Escape'}
              tooltipContent={t('project.tag.cancelCreation')}
            />
            <KbdElement
              kdb={'Enter'}
              tooltipContent={t('project.tag.create')}
            />
          </div>
        </div>
        {!isValid && (
          <p
            className={
              'body-12 text-systemRed text-center absolute bottom-[100px] right-1/2'
            }
          >
            {errors.name?.message}
          </p>
        )}

        <ColorPicker
          {...field}
          initialColor={'#8F68FF'}
          classNamePalette={styles.colorContainer}
          setColor={(color) => {
            setValue('colorBg', color)
            setSelectedColor(color)
          }}
        />
      </div>
    </form>
  )
}
