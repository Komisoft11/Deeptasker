import { observer } from 'mobx-react-lite'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionMeta, GroupBase, MultiValue, OnChangeValue } from 'react-select'
import { AsyncProps } from 'react-select/async'
import { IOption } from 'shared/ui/Autocomplete'
import { IUser, UserAutocomplete, UserOption } from '@/entities/User'
import { UserService } from '@/entities/User/services/user.service'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { SelectActions } from '@/shared/ui/Select/const'

export const UserFilterAutocomplete = observer(
  (
    props: AsyncProps<IOption<IUser>, true, GroupBase<IOption<IUser>>>
  ): ReactElement => {
    const {
      projectStore: { activeProject }
    } = useRootStore()

    const { t } = useTranslation()

    const handleChangeExecutor = (
      newValue: OnChangeValue<IOption<IUser>, true>,
      actionMeta: ActionMeta<IOption<IUser>>
    ) => {
      if (actionMeta.action === SelectActions.CLEAR) {
        //
      } else if (newValue) {
        //
      }
    }

    return (
      <UserAutocomplete<IOption<IUser>, true>
        menuPosition={'fixed'}
        backspaceRemovesValue={false}
        isClearable
        queryFn={(value) => UserService.findInProject(value, activeProject.id)}
        onChange={handleChangeExecutor}
        placeholder={t<string>('task.info.executor')}
        {...props}
      />
    )
  }
)

export const optionConvert = (executor: IUser): MultiValue<IOption<IUser>> => [
  {
    value: executor.id.toString(),
    entity: executor,
    label: <UserOption user={executor} />
  }
]

export const optionUnConvert = (
  options: MultiValue<IOption<IUser>>
): IUser[] => {
  return options.map((option) => option.entity)
}
