import {
  MouseSensor as LibMouseSensor,
  TouchSensor as LibTouchSensor
} from '@dnd-kit/core'
import { MouseEvent, TouchEvent } from 'react'

// Block DnD event propagation if element have "data-no-dnd" attribute

// Block DnD event propagation if element have "data-no-dnd" attribute
const handler = ({ nativeEvent: event }: MouseEvent | TouchEvent) => {
  let cur = event.target as HTMLElement

  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false
    }
    cur = cur.parentElement as HTMLElement
  }

  return true
}

export class MouseSensor extends LibMouseSensor {
  static activators = [
    { eventName: 'onMouseDown', handler }
  ] as (typeof LibMouseSensor)['activators']
}

export class TouchSensor extends LibTouchSensor {
  static activators = [
    { eventName: 'onTouchStart', handler }
  ] as (typeof LibTouchSensor)['activators']
}

export const DistanceXSensor = {
  activationConstraint: {
    distance: { x: 5 }
  }
}

export const DistanceYSensor = {
  activationConstraint: {
    distance: { y: 5 }
  }
}

export const DistanceXYSensor = {
  activationConstraint: {
    distance: { x: 5, y: 5 }
  }
}

export const DelaySensor = {}
