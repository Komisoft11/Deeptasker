import { Alignment, DriveStep, Side } from 'driver.js'
import 'driver.js/dist/driver.css'

export function createPopoverStep(
  element: string,
  title: string,
  description: string,
  side?: Side,
  align?: Alignment
): DriveStep {
  return {
    element: '#' + element,
    popover: {
      title,
      description,
      side,
      align
    },
    disableActiveInteraction: true
  }
}