import * as AC from '@radix-ui/react-accordion'
import { ElementRef, forwardRef } from 'react'
import { AccordionContentProps } from './defs'


export const AccordionContent = forwardRef<
  ElementRef<typeof AC.AccordionContent>,
  AccordionContentProps
>((props, ref) => {
  return <AC.AccordionContent ref={ref} {...props} />
})
