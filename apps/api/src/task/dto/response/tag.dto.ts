import { AutoMap } from '@automapper/classes'

export class TagResponse {
  @AutoMap()
  id: number

  @AutoMap()
  name: string

  @AutoMap()
  colorBg: string

  @AutoMap()
  colorFg: string
}
