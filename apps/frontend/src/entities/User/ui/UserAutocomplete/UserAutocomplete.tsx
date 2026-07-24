import debounce from 'debounce'
import React, { ReactElement } from 'react'
import { type GroupBase } from 'react-select'
import { AsyncProps } from 'react-select/async'
import { AutocompleteAsync, IOption } from 'shared/ui/Autocomplete'
import { IUser, UserOption } from '@/entities/User'
import { IObserverUser } from '@/entities/User/model/types/user.interface'

interface Props {
  queryFn: (query: string) => Promise<IUser[] | IObserverUser[]>
  userOptionsClass?: string
}

export const UserAutocomplete = <
  Option extends IOption<IUser | IObserverUser> = IOption<
    IUser | IObserverUser
  >,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  _props: AsyncProps<Option, IsMulti, Group> & Props
): ReactElement => {
  const { queryFn, userOptionsClass, ...props } = _props

  const searchUserDebounce = debounce(
    async (value: string, resolve: (value: Option[]) => void) => {
      const data = await queryFn(value)
      resolve(
        data.map(
          (u) =>
            ({
              value: u.id + '',
              label: <UserOption className={userOptionsClass} user={u} />,
              entity: u
            } as Option)
        )
      )
    },
    1000
  )

  const promiseOptions = (inputValue: string) =>
    new Promise<Option[]>((resolve) => {
      searchUserDebounce(inputValue, resolve)
    })

  return (
    <AutocompleteAsync cacheOptions loadOptions={promiseOptions} {...props} />
  )
}
