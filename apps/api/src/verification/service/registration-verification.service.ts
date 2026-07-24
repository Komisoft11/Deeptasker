import { Inject, Injectable } from '@nestjs/common'
import {
  IVerificationRepository,
  VERIFICATION_REPOSITORY
} from '../repositories/verification-repository.interface'
import { VerificationType } from '../models/verification.model'
import { AbstractVerificationService } from './verification.service'

@Injectable()
export class RegistrationVerificationService extends AbstractVerificationService {
  constructor(
    @Inject(VERIFICATION_REPOSITORY)
    private readonly repository: IVerificationRepository
  ) {
    super()
    this.repository.setVerificationType(VerificationType.Registration)
  }
  public verificationRepository = this.repository
}
