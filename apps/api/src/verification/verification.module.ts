import { forwardRef, Logger, Module } from '@nestjs/common'
import { VERIFICATION_REPOSITORY } from './repositories/verification-repository.interface'
import { VerificationRepository } from './repositories/verification-repository'
import { AuthModule } from '../auth/auth.module'
import { RegistrationVerificationService } from './service/registration-verification.service'
import { PasswordResetVerificationService } from './service/password-reset-verification.service'
import { EmailChangeVerificationService } from './service/email-change-verification.service'
import { DeleteUserVerificationService } from './service/delete-user-verification.service'

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [],
  providers: [
    RegistrationVerificationService,
    PasswordResetVerificationService,
    EmailChangeVerificationService,
    DeleteUserVerificationService,
    Logger,
    { provide: VERIFICATION_REPOSITORY, useClass: VerificationRepository }
  ],
  exports: [
    RegistrationVerificationService,
    PasswordResetVerificationService,
    EmailChangeVerificationService,
    DeleteUserVerificationService
  ]
})
export class VerificationModule {}
