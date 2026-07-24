import { observer } from 'mobx-react-lite'
import { ReactElement } from 'react'
import { GroupBase, OnChangeValue, StylesConfig } from 'react-select'
import { AsyncProps } from 'react-select/async'
import { SingleValue } from 'react-select/dist/declarations/src/types'
import { IOption } from 'shared/ui/Autocomplete'
import { Task, usePermissionTask, useTasks } from '@/entities/Task'
import { IUser, UserAutocomplete } from '@/entities/User'
import { UserService } from '@/entities/User/services/user.service'

interface Props {
  task: Task
}

export const TaskAssignerAutocomplete = observer(
  (
    _props: AsyncProps<IOption<IUser>, false, GroupBase<IOption<IUser>>> & Props
  ): ReactElement => {
    const { task, defaultValue, ...props } = _props
    const { updateAssigner } = useTasks()
    const { canChangeTaskAssigner } = usePermissionTask(task)

    const handleChangeAssigner = (
      newValue: OnChangeValue<IOption<IUser>, false>
    ) => {
      if (newValue && task.assigner.id !== newValue.entity.id) {
        task.assigner = newValue.entity
        updateAssigner.mutate([task, newValue.entity])
      }
    }

    const _value = task.assigner ? convertOptionValue(task.assigner) : undefined

    const customStyles: StylesConfig<IOption<IUser>> = {
      menu: (provided) => ({
        ...provided,
        right: 0
      })
    }

    return (
      <UserAutocomplete<IOption<IUser>, false>
        isDisabled={!canChangeTaskAssigner}
        menuPosition={'fixed'}
        backspaceRemovesValue={false}
        isClearable={false}
        value={_value}
        queryFn={(value) => UserService.findInProject(value, task.project.id)}
        onChange={handleChangeAssigner}
        placeholder={'Назначить'}
        styles={customStyles}
        {...props}
      />
    )
  }
)

const convertOptionValue = (assigner: IUser): SingleValue<IOption<IUser>> => ({
  value: assigner.id.toString(),
  entity: assigner,
  label: `${assigner.firstName} ${assigner.lastName}`
})
