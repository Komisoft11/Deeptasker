import { DriveStep } from 'driver.js'

export type StepId = string

export type TourId = string

export type GuidanceTour = {
  tourId: TourId
  steps: DriveStep[]
}
