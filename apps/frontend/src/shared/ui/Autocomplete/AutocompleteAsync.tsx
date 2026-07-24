import React, { ReactElement, useState } from 'react'
import type {
  ActionMeta,
  GroupBase,
  InputActionMeta,
  OnChangeValue
} from 'react-select'
import * as Select from 'react-select'
import { AsyncProps, default as AsyncSelect } from 'react-select/async'
import { Close, Magnify } from '@/shared/assets/images/icons'
import './Autocomplete.scss'


export const AutocompleteAsync = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: AsyncProps<Option, IsMulti, Group>
): ReactElement => {
  const customComponents: Select.SelectComponentsConfig<
    Option,
    IsMulti,
    Group
  > = {
    DropdownIndicator: () => null,
    IndicatorSeparator: () => null,
    ClearIndicator: (props) => {
      return !props.selectProps.isMulti ? (
        <CustomClearIndicator {...props} />
      ) : null
    },
    NoOptionsMessage: (props) => <CustomNoOptionsMessage {...props} />,
    LoadingMessage: (props) => <CustomLoadingMessage {...props} />
  }

  const [inputValue, setInputValue] = useState('')

  const CustomClearIndicator = (
    props: Select.ClearIndicatorProps<Option, IsMulti, Group>
  ) => {
    return (
      <Select.components.ClearIndicator {...props}>
        <div className={'iconContainer'}>
          <Close className={'h-4 w-4 cursor-pointer icon'} />
        </div>
      </Select.components.ClearIndicator>
    )
  }

  const CustomNoOptionsMessage = (
    props: Select.NoticeProps<Option, IsMulti, Group>
  ) => {
    const inputValue = props.selectProps.inputValue || ''

    if (inputValue.trim() === '') {
      return null
    }

    return (
      <Select.components.NoOptionsMessage {...props} className={'ghp-0'}>
        <p className={'body-12 text-start'}>
          По вашему запросу ничего не найдено.
        </p>
      </Select.components.NoOptionsMessage>
    )
  }

  const CustomLoadingMessage = (
    props: Select.NoticeProps<Option, IsMulti, Group>
  ) => {
    return (
      <Select.components.LoadingMessage
        {...props}
        className={'flex items-center gap-2'}
      >
        <Magnify className={'icon h-4 w-4'} />
        <p className={'body-14-16'}>Ищем...</p>
      </Select.components.LoadingMessage>
    )
  }

  const handleInputChange = (
    value: string,
    { action }: InputActionMeta
  ): void => {
    if (action === 'input-change') {
      setInputValue(value)
    }

    if (props.onInputChange) {
      props.onInputChange(value, {
        action,
        prevInputValue: ''
      })
    }
  }

  const handleChange = (
    selected: OnChangeValue<Option, IsMulti>,
    actionMeta: ActionMeta<Option>
  ) => {
    setInputValue('')

    if (props.onChange) {
      props.onChange(selected, actionMeta)
    }
  }

  const menuIsOpen = Boolean(inputValue.trim()) && inputValue != ''

  return (
    <AsyncSelect
      {...props}
      isClearable={true}
      menuShouldScrollIntoView={true}
      menuPortalTarget={document.body}
      onInputChange={handleInputChange}
      onChange={handleChange}
      menuIsOpen={menuIsOpen}
      menuPlacement={'auto'}
      components={customComponents}
      classNamePrefix='DT_Autocomplete'
      data-ignore-click
      placeholder={props.placeholder}
    />
  )
}
