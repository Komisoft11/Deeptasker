import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { FC, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { alwaysDisabledListKeys } from '@/features/Project/PermissionCheckboxes/const/permissions'
import { CategoriesAccordion } from '@/features/Project/PermissionCheckboxes/ui/CategoriesAccordion/CategoriesAccordion'
import {
  IPermissionProject,
  IProjectPermissionRole,
  Project,
  defaultProjectRolesPermissions,
  usePermissionProject,
  useProjects
} from '@/entities/Project'
import { getPermissionDescription } from '@/entities/Project/model/permissions/project.permissions'
import { IUser } from '@/entities/User'
import { queries } from '@/entities/lib/api/all-queries'
import { CaretDown } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { AccordionContent } from '@/shared/ui/Accordion/AccordionContent'
import { AccordionItem } from '@/shared/ui/Accordion/AccordionItem'
import { AccordionTrigger } from '@/shared/ui/Accordion/AccordionTrigger'
import { Switch, SwitchProps } from '@/shared/ui/Switch/Switch'

interface Props {
  user: IUser
  project: Project
  canManageAdmins?: boolean
}

export const PermissionCheckboxes: FC<Props> = observer(
  ({ project, user, canManageAdmins }) => {
    const { changePermissionsAsync } = useProjects()
    const { permissions, role } = usePermissionProject(project, user)
    const ql = useQueryClient()
    const { t } = useTranslation([ENTITY])

    const baseCategories: Record<string, (keyof IPermissionProject)[]> = {
      generalRights: ['edit', 'delete'],
      folders: ['listFolders', 'createFolders', 'editFolders', 'deleteFolders'],
      tags: ['createTags', 'updateTags', 'deleteTags'],
      sprints: [
        'listSprints',
        'createSprints',
        'updateSprints',
        'deleteSprints'
      ],
      reports: ['listReports', 'generateReports', 'deleteReports'],
      usersAndAdmins: ['addUsers', 'removeUsers', 'manageAdmins']
    }

    const taskCategories: Record<string, (keyof IPermissionProject)[]> = {
      tasksGeneral: [
        'listTasks',
        'openTasks',
        'createTasks',
        'deleteTasks',
        'moveTasks'
      ],
      changeTaskRoles: [
        'changeTaskAssigner',
        'changeTaskExecutor',
        'manageTaskObservers'
      ],
      changeTaskSettings: [
        'editTaskTitle',
        'editTaskDescription',
        'editTaskDeadline',
        'editTaskStatus',
        'editTaskPriority',
        'editTaskTags',
        'editTaskTracking'
      ],
      deleteInTask: ['deleteTaskComments', 'deleteTaskFile'],
      executeTask: ['executeTask']
    }

    const handleChangePermissions = (
      name: keyof IPermissionProject,
      checked: boolean
    ) => {
      const newPermissions = { ...permissions, [name]: checked }
      changePermissionsAsync.mutate(
        [
          user,
          project,
          { role, projectId: project.id, permissions: newPermissions }
        ],
        {
          onSuccess: (_, params) => {
            ql.setQueryData<IProjectPermissionRole>(
              queries.user.permissionsProject(project, user).queryKey,
              () => params[2]
            )
          }
        }
      )
    }

    const renderCategory = (
      title: string,
      keys: (keyof IPermissionProject)[],
      className?: string,
      triggerClassName?: string
    ) => {
      const baseKeys = keys.filter(
        (key) => defaultProjectRolesPermissions[role][key]
      )
      if (!baseKeys.length) return null

      return (
        <AccordionItem
          key={title}
          value={title}
          className={classNames(
            'flex flex-col rounded-xl p-4',
            'data-[state=open]:gap-3',
            className
          )}
        >
          <AccordionTrigger
            className={classNames(
              'flex w-full justify-between items-center !p-0 group',
              triggerClassName
            )}
          >
            <h3>{t(`project.permissions.categories.${title}`)}</h3>
            <CaretDown
              className={classNames(
                'w-5 h-5 transition-transform duration-200',
                'group-data-[state=open]:rotate-180'
              )}
            />
          </AccordionTrigger>

          <AccordionContent className='flex flex-col'>
            {baseKeys.map((key) => (
              <PermissionCheckbox
                key={key}
                description={t(
                  `project.permissions.actions.${getPermissionDescription(
                    key
                  )}`,
                  { ns: ENTITY }
                )}
                checked={
                  alwaysDisabledListKeys.includes(key) ? true : permissions[key]
                }
                disabled={
                  !canManageAdmins || alwaysDisabledListKeys.includes(key)
                }
                onCheckedChange={(checked) =>
                  handleChangePermissions(key, checked)
                }
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      )
    }

    return (
      <div
        className={classNames(
          'flex overflow-y-auto flex-[1_0_0] gap-2',
          'scrollbarContainerOnObjects'
        )}
      >
        <CategoriesAccordion
          categories={baseCategories}
          className='flex flex-col w-1/2 gap-2'
          renderCategory={renderCategory}
          itemClassName={'bg-hover'}
        />
        <CategoriesAccordion
          categories={taskCategories}
          className='flex flex-col gap-3 w-1/2 p-4 rounded-xl bg-hover h-max'
          title={
            t('project.permissions.categories.tasks', { ns: ENTITY }) as string
          }
          renderCategory={renderCategory}
          itemClassName={
            '!p-0 !gap-0 !pb-3 border-b border-hover !rounded-none last:!border-b-0 last:!pb-0'
          }
          triggerClassName={'!py-2'}
        />
      </div>
    )
  }
)

interface PermissionCheckboxProps extends SwitchProps {
  description: string
  disabled?: boolean
}

const PermissionCheckbox = forwardRef<
  HTMLButtonElement,
  PermissionCheckboxProps
>(({ disabled, description, onChange, ...props }, ref) => {
  return (
    <div className='flex items-center justify-between py-2 cursor-pointer select-none rounded-lg'>
      <Switch
        {...props}
        label={description}
        ref={ref}
        labelClassName={'body-16'}
        containerClassName={
          'flex w-full items-center justify-between cursor-pointer'
        }
        disabled={disabled !== undefined ? disabled : false}
      />
    </div>
  )
})