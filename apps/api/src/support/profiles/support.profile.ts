import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { createMap, Mapper, MappingProfile } from '@automapper/core'
import { UploadedFileResponse } from '../../task/dto'
import { FileModel } from '../../file/models/file.model'

@Injectable()
export class SupportProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(mapper, FileModel, UploadedFileResponse)
    }
  }
}
