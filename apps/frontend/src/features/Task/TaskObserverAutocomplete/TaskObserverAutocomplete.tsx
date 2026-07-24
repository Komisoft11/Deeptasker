import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionMeta, MultiValue, OnChangeValue } from 'react-select'
import { IOption } from 'shared/ui/Autocomplete'
import { Task, TaskRoles, useTasks } from '@/entities/Task'
import { UserAutocomplete } from '@/entities/User'
import { IObserverUser } from '@/entities/User/model/types/user.interface'
import { UserService } from '@/entities/User/services/user.service'
import { SelectActions } from '@/shared/ui/Select/const'

interface Props {
  task: Task
  disabled?: boolean
}

export const TaskObserverAutocomplete: FC<Props> = observer(
  ({ task, disabled }) => {
    const { t } = useTranslation()
    const { assignObserverAsync, reassignObserverAsync } = useTasks()

    const [value, setValue] = useState<MultiValue<IOption<IObserverUser>>>([])

    const getConvertedValue = () =>
      task.invited
        .filter((observer) => observer.role?.code === TaskRoles.OBSERVER)
        .map((observer) => ({
          value: observer.user.id + '',
          entity: observer.user,
          label: `${observer.user.firstName} ${observer.user.lastName}`
        })) || []

    const handleChangeObservers = (
      newValue: OnChangeValue<IOption<IObserverUser>, true>,
      actionMeta: ActionMeta<IOption<IObserverUser>>
    ) => {
      const { action, removedValue } = actionMeta

      if (action === SelectActions.CLEAR) {
        task.invited.forEach((observer) => {
          reassignObserverAsync.mutate([task, observer.user])
        })
        setValue([])
        return
      }

      if (
        (action === SelectActions.REMOVE_VALUE ||
          action === SelectActions.POP_VALUE) &&
        removedValue
      ) {
        reassignObserverAsync.mutate([task, removedValue.entity])
        const updatedValue = value.filter(
          (option) => option.entity.id !== removedValue.entity.id
        )
        setValue(updatedValue)
        return
      }

      if (newValue) {
        newValue.forEach((option) => {
          assignObserverAsync.mutate([task, option.entity])
        })
        setValue([...newValue])
      }
    }

    useEffect(() => {
      setValue(getConvertedValue())
    }, [task.id, task.invited.length])

    return (
      <UserAutocomplete
        value={value}
        className={'w-full'}
        queryFn={(value) => UserService.findInProject(value, task.project.id)}
        isDisabled={disabled}
        menuPlacement={'top'}
        isMulti={true}
        isClearable={true}
        onChange={handleChangeObservers}
        placeholder={t<string>('task.observer')}
      />
    )
  }
)
