import { SprintDto } from '../../../sprint/dto/out/sprint.dto'

export type ISprintCreateEvent = Pick<
  SprintDto,
  'title' | 'description' | 'status' | 'dateCreated' | 'dateEnd' | 'dateStart'
>