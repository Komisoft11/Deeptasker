import * as AC from '@radix-ui/react-accordion'
import { FC } from 'react'
import { AccordionContent } from '@/shared/ui/Accordion/AccordionContent'
import { AccordionItem } from '@/shared/ui/Accordion/AccordionItem'
import { AccordionTrigger } from '@/shared/ui/Accordion/AccordionTrigger'
import { AccordionProps } from '@/shared/ui/Accordion/defs'


interface DotNotation {
  Item: typeof AccordionItem
  Trigger: typeof AccordionTrigger
  Content: typeof AccordionContent
}

export const Accordion: FC<AccordionProps> & DotNotation = (props) => {
  return <AC.Root {...props} />
}

Accordion.Item = AccordionItem
Accordion.Trigger = AccordionTrigger
Accordion.Content = AccordionContent
