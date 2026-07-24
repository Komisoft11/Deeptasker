import * as DropdownMenuRadix from '@radix-ui/react-dropdown-menu'
import classNames from 'classnames'
import { FC } from 'react'
import './DropdownMenu.scss'

/** Anatomy
 //  <DropdownMenu.Root>
 //    <DropdownMenu.Trigger />
 //
 //    <DropdownMenu.Portal>
 //      <DropdownMenu.Content>
 //        <DropdownMenu.Label />
 //        <DropdownMenu.Item />
 //
 //        <DropdownMenu.Group>
 //          <DropdownMenu.Item />
 //        </DropdownMenu.Group>
 //
 //        <DropdownMenu.CheckboxItem>
 //          <DropdownMenu.ItemIndicator />
 //        </DropdownMenu.CheckboxItem>
 //
 //        <DropdownMenu.RadioGroup>
 //          <DropdownMenu.RadioItem>
 //            <DropdownMenu.ItemIndicator />
 //          </DropdownMenu.RadioItem>
 //        </DropdownMenu.RadioGroup>
 //
 //        <DropdownMenu.Sub>
 //          <DropdownMenu.SubTrigger />
 //          <DropdownMenu.Portal>
 //            <DropdownMenu.SubContent />
 //          </DropdownMenu.Portal>
 //        </DropdownMenu.Sub>
 //
 //        <DropdownMenu.Separator />
 //        <DropdownMenu.Arrow />
 //      </DropdownMenu.Content>
 //    </DropdownMenu.Portal>
 //  </DropdownMenu.Root>
 */

interface DotNotation {
  Content: typeof DropdownMenuContent
  Item: typeof DropdownMenuItem
  Trigger: typeof DropdownMenuTrigger
}

export const DropdownMenu: FC<DropdownMenuRadix.DropdownMenuProps> &
  DotNotation = (props) => {
  return <DropdownMenuRadix.Root {...props} />
}

const DropdownMenuTrigger: FC<DropdownMenuRadix.DropdownMenuTriggerProps> = ({
  className,
  ...props
}) => {
  return (
    <DropdownMenuRadix.Trigger
      className={classNames('DT_DropdownMenuLabel', className)}
      {...props}
    />
  )
}

const DropdownMenuContent: FC<DropdownMenuRadix.DropdownMenuContentProps> = ({
  className,
  ...props
}) => {
  return (
    <DropdownMenuRadix.Portal>
      <DropdownMenuRadix.Content
        className={classNames('DT_DropdownMenuContent', className)}
        {...props}
      />
    </DropdownMenuRadix.Portal>
  )
}

const DropdownMenuItem: FC<DropdownMenuRadix.DropdownMenuItemProps> = ({
  className,
  ...props
}) => {
  return (
    <DropdownMenuRadix.Item
      className={classNames('DT_DropdownMenuItem', className)}
      {...props}
    />
  )
}

DropdownMenu.Item = DropdownMenuItem
DropdownMenu.Trigger = DropdownMenuTrigger
DropdownMenu.Content = DropdownMenuContent
