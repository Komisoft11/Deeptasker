import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import styles from '@/pages/Project/ProjectPage/ProjectPage.module.scss'
import {
  IProjectUpdateDto,
  projectSettingsSchema,
  usePermissionProject
} from '@/entities/Project'
import useProjects from '@/entities/Project/lib/hooks/useProjects'
import { PROJECTS_SLUG_URL, RouterParams } from '@/shared/config/route.config'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { transformToSlug } from '@/shared/lib/helpers/main.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { MainPageNavigator } from '@/shared/lib/navigators/main.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { Input } from '@/shared/ui/Input/Input'


type FormData = Omit<IProjectUpdateDto, 'id'>

export const ProjectSettingsTab: FC = observer(() => {
  const { projectId } = useParams<RouterParams>()

  const {
    workspaceStore: { activeWorkspace },
    projectStore
  } = useRootStore()

  const project = projectStore.get(Number(projectId))

  const { t } = useTranslation([TRANSLATION, ENTITY])
  const { updateAsync, isSlugExists, isTitleExists } = useProjects()

  const {
    permissions: { edit: canEdit }
  } = usePermissionProject(project)

  const initialData = {
    title: project.title,
    slug: project.slug
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid, dirtyFields },
    control,
    reset
  } = useForm<FormData>({
    defaultValues: initialData,
    resolver: yupResolver(
      projectSettingsSchema(
        async function (value: any) {
          if (value && value !== project.title) {
            return !isTitleExists(value)
          }
          return true
        },
        async function (value: any) {
          if (value && value !== project.slug) {
            return !isSlugExists(value)
          }
          return true
        }
      )
    ),
    mode: 'all'
  })

  const url = `${MainPageNavigator.getEmptyProjectUrl(
    activeWorkspace.id
  )}/${PROJECTS_SLUG_URL}/`

  const onSave = async (data: FormData) => {
    const updatedInfo: Partial<FormData> = Object.entries(data).reduce(
      (acc, [key, value]) => {
        if (dirtyFields[key as keyof FormData]) {
          acc[key as keyof FormData] =
            value === '' || value === undefined ? null : value
        }
        return acc
      },
      {} as any
    )

    await updateAsync.mutateAsync({
      workspaceId: activeWorkspace.id,
      dto: { id: project.id, ...updatedInfo }
    })

    reset(data)
  }

  const handleReset = () => {
    reset(initialData)
  }

  useEffect(() => {
    reset({
      title: project.title,
      slug: project.slug
    })
  }, [project.title, project.slug, reset])

  return (
    <div className={'flex flex-col h-full justify-between px-4 pb-4'}>
      <form
        className={'flex flex-col max-w-[844px]'}
        onSubmit={handleSubmit(onSave)}
        key={project.slug + project.title}
      >
        <HorizontalLayout labelText={t('project.changePath', { ns: ENTITY })}>
          <div className={'flex flex-col gap-1 max-w-[560px] w-full'}>
            <div
              className={classNames(
                styles.container,
                !canEdit &&
                  'bg-transparent border border-border cursor-not-allowed'
              )}
            >
              <p className={'secondaryText body-14-16 w-full max-w-max'}>
                {url}
              </p>
              <Controller
                name='slug'
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    value={value}
                    onChange={(e) => {
                      const raw = e.target.value
                      onChange(transformToSlug(raw))
                    }}
                    onBlur={onBlur}
                    placeholder={'Slug'}
                    className={classNames(
                      styles.input,
                      !canEdit && 'pointer-events-none'
                    )}
                    maxLength={32}
                    minLength={1}
                    autoComplete='off'
                    containerClassName={'focus-within:!outline-none'}
                  />
                )}
              />
            </div>
            {errors?.slug?.message && (
              <p className={'body-12 text-systemRed'}>{errors.slug.message}</p>
            )}
          </div>
        </HorizontalLayout>

        <HorizontalLayout labelText={t('project.name', { ns: ENTITY })}>
          <div className={'flex flex-col gap-1 max-w-[560px] w-full'}>
            <Input
              {...register('title')}
              placeholder={t('project.enterName', { ns: ENTITY }) as string}
              className={'w-full'}
              disabled={!canEdit}
              maxLength={64}
            />
            {errors?.title?.message && (
              <p className={'body-12 text-systemRed'}>{errors.title.message}</p>
            )}
          </div>
        </HorizontalLayout>

        {isDirty && isValid && (
          <div className={'flex gap-2 pt-6 w-full'}>
            <Button
              type={'button'}
              styleButton={'outline'}
              onClick={handleReset}
              className={'px-4 max-h-12 body-14-16'}
            >
              {t('cancel', { ns: TRANSLATION })}
            </Button>
            <Button
              type={'submit'}
              styleButton={'filled'}
              className={'px-4 max-h-12 body-14-16'}
            >
              {t('save', { ns: TRANSLATION })}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
})
