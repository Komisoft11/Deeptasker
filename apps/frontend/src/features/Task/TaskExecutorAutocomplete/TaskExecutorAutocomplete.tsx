import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActionMeta,
  GroupBase,
  OnChangeValue,
  StylesConfig
} from 'react-select'
import { AsyncProps } from 'react-select/async'
import { SingleValue } from 'react-select/dist/declarations/src/types'
import { IOption } from 'shared/ui/Autocomplete'
import { Task, usePermissionTask, useTasks } from '@/entities/Task'
import { IUser, UserAutocomplete } from '@/entities/User'
import { UserService } from '@/entities/User/services/user.service'
import { ENTITY } from '@/shared/const/translation'
import { SelectActions } from '@/shared/ui/Select/const'

interface Props {
  task: Task
  disabled?: boolean
  styles?: StylesConfig<IOption<IUser>>
}

export const TaskExecutorAutocomplete = (
  _props: AsyncProps<IOption<IUser>, false, GroupBase<IOption<IUser>>> & Props
): ReactElement => {
  const { task, defaultValue, disabled, styles, ...props } = _props
  const { assignUserAsync, reassignUserAsync } = useTasks()
  const { canChangeTaskExecutor } = usePermissionTask(task)
  const { t } = useTranslation(ENTITY)

  const value = task.executor?.id ? convertOptionValue(task.executor) : null

  const handleChangeExecutor = async (
    newValue: OnChangeValue<IOption<IUser>, false>,
    actionMeta: ActionMeta<IOption<IUser>>
  ) => {
    if (actionMeta.action === SelectActions.CLEAR) {
      task.executor = null
      await reassignUserAsync.mutateAsync(task)
    } else if (newValue && task.executor?.id !== newValue.entity.id) {
      task.executor = newValue.entity
      await assignUserAsync.mutateAsync([task, newValue.entity])
    }
  }

  const customStyles: StylesConfig<IOption<IUser>> = styles ?? {
    menu: (provided) => ({
      ...provided,
      right: 0
    })
  }

  return (
    <UserAutocomplete<IOption<IUser>, false>
      menuPosition={'fixed'}
      backspaceRemovesValue={false}
      isClearable={true}
      value={value}
      queryFn={(value) => UserService.findInProject(value, task.project.id)}
      onChange={handleChangeExecutor}
      placeholder={t('task.info.assign')}
      styles={customStyles}
      isDisabled={!canChangeTaskExecutor || disabled}
      data-ignore-click='true'
      {...props}
    />
  )
}

const convertOptionValue = (executor: IUser): SingleValue<IOption<IUser>> => ({
  value: executor.id.toString(),
  entity: executor,
  label: `${executor.firstName} ${executor.lastName}`
})
