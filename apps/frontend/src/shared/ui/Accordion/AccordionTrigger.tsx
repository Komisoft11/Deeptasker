import * as AC from '@radix-ui/react-accordion'
import { ElementRef, forwardRef } from 'react'
import { AccordionTriggerProps } from './defs'


export const AccordionTrigger = forwardRef<
  ElementRef<typeof AC.AccordionTrigger>,
  AccordionTriggerProps
>((props, ref) => {
  return (
    <AC.AccordionHeader>
      <AC.AccordionTrigger {...props} ref={ref} />
    </AC.AccordionHeader>
  )
})
