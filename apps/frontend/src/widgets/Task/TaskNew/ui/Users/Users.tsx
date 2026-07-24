import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { GroupBase, MultiValue, SingleValue, StylesConfig } from 'react-select'
import { IUser, UserAutocomplete } from '@/entities/User'
import { IObserverUser } from '@/entities/User/model/types/user.interface'
import { UserService } from '@/entities/User/services/user.service'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { IOption } from '@/shared/ui/Autocomplete'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { TaskCreationData } from '../../types/task-creation.interface'
import styles from './Users.module.scss'


interface Props {
  control: Control<TaskCreationData>
}

export const Users = observer(({ control }: Props) => {
  const {
    projectStore: { activeProject }
  } = useRootStore()

  const { t } = useTranslation(ENTITY)

  const customStyles: StylesConfig<IOption<IUser>> = {
    menu: (provided) => ({
      ...provided,
      right: 0
    })
  }

  const customObserverStyles: StylesConfig<
    IOption<IObserverUser>,
    true,
    GroupBase<IOption<IObserverUser>>
  > = {
    menu: (provided) => ({
      ...provided,
      right: 0
    }),
    control: (provided) => ({
      ...provided,
      maxWidth: '100% !important'
    })
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={'flex flex-col gap-1'}
    >
      <HorizontalLayout
        labelText={t('task.info.executor')}
        className={'w-fit'}
        containerClassName={classNames(
          'justify-between pt-4 pb-4',
          styles.container
        )}
      >
        <div className={classNames('w-[180px] h-[34px]', styles.item)}>
          <Controller
            control={control}
            name={'executor'}
            render={({ field: { onChange, value } }) => (
              <UserAutocomplete<IOption<IUser>, false>
                menuPortalTarget={this}
                menuPosition={'absolute'}
                backspaceRemovesValue={false}
                isClearable={true}
                className={'h-[34px]'}
                styles={customStyles}
                value={value && convertUserToOption(value)}
                queryFn={(value) =>
                  UserService.findInProject(value, activeProject.id)
                }
                onChange={(option) => {
                  onChange(option?.entity)
                }}
                placeholder={t('task.info.assign')}
              />
            )}
          />
        </div>
      </HorizontalLayout>
      <HorizontalLayout
        labelText={t('task.info.assigner')}
        className={'w-fit'}
        containerClassName={classNames(
          'justify-between pt-4 pb-4',
          styles.container
        )}
      >
        <div className={classNames('w-[180px]', styles.item)}>
          <Controller
            control={control}
            name={'assigner'}
            render={({ field: { onChange, value } }) => {
              return (
                <UserAutocomplete<IOption<IUser>, false>
                  menuPortalTarget={this}
                  menuPosition={'absolute'}
                  backspaceRemovesValue={false}
                  isClearable={true}
                  value={convertUserToOption(value)}
                  queryFn={(value) =>
                    UserService.findInProject(value, activeProject.id)
                  }
                  styles={customStyles}
                  onChange={(option) => {
                    onChange(option?.entity)
                  }}
                  placeholder={t('task.info.assign')}
                />
              )
            }}
          />
        </div>
      </HorizontalLayout>
      <HorizontalLayout
        labelText={t('task.info.observers')}
        className={'w-fit'}
        containerClassName={'flex flex-col gap-2 pt-4 pb-4'}
      >
        <Controller
          control={control}
          name={'observers'}
          render={({ field: { onChange, value } }) => {
            return (
              <UserAutocomplete
                menuPortalTarget={this}
                menuPosition={'absolute'}
                isMulti={true}
                isClearable={true}
                value={value && convertObserversToOptions(value)}
                className={classNames('w-full', styles.item)}
                styles={customObserverStyles}
                queryFn={(value) =>
                  UserService.findInProject(value, activeProject.id)
                }
                onChange={(options) =>
                  onChange(options.map((option) => option && option.entity))
                }
                placeholder={t('task.info.assign')}
              />
            )
          }}
        />
      </HorizontalLayout>
    </div>
  )
})

function converter(
  user: IUser | IObserverUser
): IOption<IUser> | IOption<IObserverUser> {
  return {
    value: user.id.toString(),
    entity: user,
    label: UserService.getFullName(user)
  }
}

function convertUserToOption(
  user?: IUser
): SingleValue<IOption<IUser>> | undefined {
  if (user) {
    return converter(user) as IOption<IUser>
  }

  return undefined
}

function convertObserversToOptions(
  users: IObserverUser[]
): MultiValue<IOption<IObserverUser>> {
  return users.map((user) => converter(user))
}

function handleMouseEnter() {
  document.body.style.pointerEvents = 'auto'
}

function handleMouseLeave() {
  document.body.style.pointerEvents = 'none'
}
