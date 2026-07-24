import * as AC from '@radix-ui/react-accordion'
import { ElementRef, forwardRef } from 'react'
import { AccordionItemProps } from './defs'


export const AccordionItem = forwardRef<
  ElementRef<typeof AC.AccordionItem>,
  AccordionItemProps
>((props, ref) => {
  return <AC.AccordionItem {...props} ref={ref}></AC.AccordionItem>
})
