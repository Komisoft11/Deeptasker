import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IUserDocumentsRepository,
  USER_DOCUMENTS_REPOSITORY
} from './repositories/user-documents/user-documents-repository.interface'
import { TransactionOrKnex } from 'objection'
import { AgreeWithPolicyRequest } from './dto'
import { Documents } from './types'

@Injectable()
export class PoliciesService {
  constructor(
    @Inject(USER_DOCUMENTS_REPOSITORY)
    private readonly userDocumentsRepository: IUserDocumentsRepository
  ) {}

  public async agreeWithPolitics(
    dto: AgreeWithPolicyRequest,
    trx?: TransactionOrKnex
  ): Promise<void> {
    const documents = await this.userDocumentsRepository.getLastVersionsDocuments()
    this.checkDocuments(documents)

    await this.userDocumentsRepository.agreeWithPolitics(dto, documents, trx)
  }

  private checkDocuments(documents: Documents) {
    const messages: string[] = []

    if (!documents.consent?.id) {
      messages.push('consent')
    }
    if (!documents.personalDataPolicy?.id) {
      messages.push('personalDataPolicy')
    }
    if (!documents.privacyPolicy?.id) {
      messages.push('privacyPolicy')
    }
    if (!documents.termsOfUse?.id) {
      messages.push('termsOfUse')
    }
    if (!documents.userAgreement?.id) {
      messages.push('userAgreement')
    }

    if (messages.length) {
      throw new NotFoundException('Can not find documents: ' + messages.join(', '))
    }
  }
}
