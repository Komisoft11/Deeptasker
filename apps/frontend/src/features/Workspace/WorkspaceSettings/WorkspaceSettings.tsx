import { yupResolver } from '@hookform/resolvers/yup'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import {
  IWorkspaceUpdateDto,
  workspaceSettingsSchema
} from '@/entities/Workspace'
import { useWorkspaces } from '@/entities/Workspace/lib/hooks/useWorkspaces'
import { usePermissionWorkspace } from '@/entities/Workspace/model/PermissionWorkspace'
import { RouterParams } from '@/shared/config/route.config'
import { DATE_FORMAT } from '@/shared/const/date_format'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { Input } from '@/shared/ui/Input/Input'
import styles from './WorkspaceSettings.module.scss'


type FormData = Pick<IWorkspaceUpdateDto, 'title'>

export const WorkspaceSettings = observer(() => {
  const {
    workspaceStore,
    dialogStore: { deleteDialog }
  } = useRootStore()
  const { workspaceId } = useParams<RouterParams>()
  const workspace = workspaceStore.get(Number(workspaceId))

  const { user, dateCreated } = workspace
  const formattedDateCreated = dayjs(dateCreated).format(DATE_FORMAT)
  const { t } = useTranslation([TRANSLATION, ENTITY])
  const { updateAsync, deleteAsync } = useWorkspaces()

  const handleDelete = async () => {
    if (!workspace) return

    if (workspace.projectCount !== 0) {
      deleteDialog.title = `${workspace.title} / ${t('delete', {
        ns: TRANSLATION
      })}`
      deleteDialog.body = (
        <div className='flex flex-col gap-6 pt-6'>
          <div className='flex flex-col gap-2'>
            <h3>{workspace.title}</h3>
            <p className='secondaryText body-14-20'>
              {t('workspace.confirmDelete', { ns: ENTITY })} {workspace.title}?
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='body-12 secondaryText'>
              {t('workspace.youLose', { ns: ENTITY })}
            </p>
            <p className='body-16'>
              {t('project.projectsCount', {
                ns: ENTITY,
                count: workspace.projectCount
              })}
            </p>
          </div>
        </div>
      )
      deleteDialog.buttonText = t('delete', { ns: TRANSLATION })
      deleteDialog.deleteFunction = async () => {
        await deleteAsync.mutateAsync(workspace)
      }
    } else {
      await deleteAsync.mutateAsync(workspace)
    }
  }

  const { canEditWorkspace, canDeleteWorkspace } =
    usePermissionWorkspace(workspace)

  const userName = `${user.firstName} ${user.lastName}`

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset
  } = useForm<FormData>({
    defaultValues: { title: workspace.title },
    resolver: yupResolver(workspaceSettingsSchema),
    mode: 'all'
  })

  useEffect(() => {
    reset({ title: workspace.title })
  }, [workspace.title, reset])

  const onSave = async (data: FormData) => {
    await updateAsync.mutateAsync({ id: workspace.id, ...data })
    reset({ title: workspace.title })
  }

  const onCancel = () => {
    reset({ title: workspace.title })
  }

  const isLastWorkspace = workspaceStore.workspaces.length === 1
  const canShowDeleteWorkspace = canDeleteWorkspace && !isLastWorkspace

  return (
    <div className={'flex flex-col h-full justify-between px-4 pb-4'}>
      <div>
        <form
          className={'flex flex-col w-[920px]'}
          onSubmit={handleSubmit(onSave)}
        >
          <HorizontalLayout labelText={t('name', { ns: TRANSLATION })}>
            <div className={'flex flex-col gap-1 w-full max-w-[560px]'}>
              <Input
                {...register('title')}
                placeholder={'Введите название проекта'}
                inputClassName={'max-h-12 h-12'}
                disabled={!canEditWorkspace}
              />
              {errors?.title?.message && (
                <p className={'body-12 text-systemRed pl-3'}>
                  {errors.title.message}
                </p>
              )}
            </div>
          </HorizontalLayout>

          <HorizontalLayout labelText={t('workspace.creator', { ns: ENTITY })}>
            <Input className={styles.input} value={userName} readOnly={true} />
          </HorizontalLayout>

          <HorizontalLayout
            labelText={t('dateCreated', { ns: TRANSLATION })}
            noBorder={true}
          >
            <Input
              className={styles.input}
              value={formattedDateCreated}
              readOnly={true}
            />
          </HorizontalLayout>

          {isDirty && isValid && (
            <div className={'flex gap-2 py-6'}>
              <Button type={'submit'} styleButton={'filled'} className={'px-4'}>
                {t('save', { ns: TRANSLATION })}
              </Button>

              <Button
                type={'button'}
                styleButton={'outline'}
                onClick={onCancel}
                className={'px-4 max-h-12'}
              >
                {t('cancel', { ns: TRANSLATION })}
              </Button>
            </div>
          )}
        </form>
      </div>

      {canShowDeleteWorkspace && (
        <div
          className={'flex justify-between w-full pt-6 self-end items-start'}
        >
          <div className={'flex flex-col gap-2 max-w-[585px]'}>
            <h4>{t('workspace.deleteTitle', { ns: ENTITY })}</h4>
            <p className={'secondaryText body-12'}>
              {t('workspace.deleteBody', { ns: ENTITY })}
            </p>
          </div>
          <Button
            colorButton={'red'}
            styleButton={'outline'}
            onClick={handleDelete}
            className={'w-[97px] max-h-12 body-16'}
          >
            {t('delete', { ns: TRANSLATION })}
          </Button>
        </div>
      )}
      {isLastWorkspace && (
        <p className={'body-12 secondaryText flex w-full pt-6 justify-center'}>
          {t('workspace.cannotDeleteLast', { ns: ENTITY })}
        </p>
      )}
    </div>
  )
})
