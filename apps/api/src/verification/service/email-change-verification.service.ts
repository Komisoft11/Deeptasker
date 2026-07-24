import { Inject, Injectable } from '@nestjs/common'
import { AbstractVerificationService } from './verification.service'
import {
  IVerificationRepository,
  VERIFICATION_REPOSITORY
} from '../repositories/verification-repository.interface'
import { VerificationType } from '../models/verification.model'

@Injectable()
export class EmailChangeVerificationService extends AbstractVerificationService {
  constructor(
    @Inject(VERIFICATION_REPOSITORY)
    private readonly repository: IVerificationRepository
  ) {
    super()
    this.repository.setVerificationType(VerificationType.EmailChange)
  }
  public verificationRepository = this.repository
}
