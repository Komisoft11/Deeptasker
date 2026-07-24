import React, { ReactElement } from 'react'
import type { GroupBase } from 'react-select'
import * as Select from 'react-select'
import { Close } from '@/shared/assets/images/icons'
import './Autocomplete.scss'


export const Autocomplete = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: Select.Props<Option, IsMulti, Group>
): ReactElement => {
  const customComponents: Select.SelectComponentsConfig<
    Option,
    IsMulti,
    Group
  > = {
    DropdownIndicator: () => null,
    IndicatorSeparator: () => null,
    ClearIndicator: (props) => <CustomClearIndicator {...props} />
  }

  const CustomClearIndicator = (
    props: Select.ClearIndicatorProps<Option, IsMulti, Group>
  ) => {
    return (
      <Select.components.ClearIndicator {...props}>
        <Close className={'p-[2px] mr-2'} />
      </Select.components.ClearIndicator>
    )
  }

  return (
    <Select.default
      isClearable={true}
      menuShouldScrollIntoView={true}
      menuPortalTarget={document.body}
      menuPlacement={'auto'}
      components={customComponents}
      classNamePrefix='DT_Autocomplete'
      {...props}
    />
  )
}
