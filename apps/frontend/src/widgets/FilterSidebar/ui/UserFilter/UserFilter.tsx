import { useQuery } from '@tanstack/react-query'
import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { MultiValue } from 'react-select'
import {
  UserFilterAutocomplete,
  optionConvert,
  optionUnConvert
} from '@/features/User/UserFilterAutocomplete/UserFilterAutocomplete'
import { IUser } from '@/entities/User'
import { queries } from '@/entities/lib/api/all-queries'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { IOption } from '@/shared/ui/Autocomplete'
import { Button } from '@/shared/ui/Button/Button'
import { Loading } from '@/shared/ui/Loading/Loading'


interface Props {
  name: string
  onChange?: (newValue: number[]) => void
  value?: number[]
}

export const UserFilter: FC<Props> = observer(
  ({ onChange, value = [], name }) => {
    const {
      projectStore: { activeProject }
    } = useRootStore()

    const { data: users, isLoading } = useQuery({
      ...queries.user.getUsersByIds(value, activeProject, name),
      enabled: value.length > 0
    })

    const { t } = useTranslation()

    const handleOnChange = (options: MultiValue<IOption<IUser>>) => {
      onChange?.(optionUnConvert(options).map((user) => user.id))
    }

    const setCurrentUser = () => {
      const me: IUser = LocalStorageHelper.getUser()
      onChange?.([me.id])
    }

    if (isLoading) {
      return <Loading variant={'spinner'} />
    }

    return (
      <div className={'flex gap-1 items-start'}>
        <UserFilterAutocomplete
          isMulti
          className={'flex-auto'}
          placeholder={t(`task.info.${name}`)}
          value={users?.flatMap((user) => optionConvert(user)) ?? []}
          onChange={handleOnChange}
          classNames={{
            control: () => '!max-w-full',
            multiValueRemove: () => 'flex items-center'
          }}
        />
        <Button
          styleButton={'filled'}
          colorButton={'dark'}
          className={'w-9 h-[38px] body-14-20'}
          onClick={setCurrentUser}
        >
          {t('user.me')}
        </Button>
      </div>
    )
  }
)
