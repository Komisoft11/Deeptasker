import { Module } from '@nestjs/common'
import { PoliciesService } from './policies.service'
import { USER_DOCUMENTS_REPOSITORY } from './repositories/user-documents/user-documents-repository.interface'
import { UserDocumentsRepository } from './repositories/user-documents/user-documents.repository'
import { FileModule } from '../file/file.module'
import { PoliciesController } from './policies.controller'

@Module({
  imports: [FileModule],
  controllers: [PoliciesController],
  providers: [
    PoliciesService,
    { provide: USER_DOCUMENTS_REPOSITORY, useClass: UserDocumentsRepository }
  ],
  exports: [PoliciesService]
})
export class PoliciesModule {
}
