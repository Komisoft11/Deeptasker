import { forwardRef, Module } from '@nestjs/common'
import { PaymentController } from './payment.controller'
import { JwtModule } from '@nestjs/jwt'
import { WorkspaceModule } from '../workspace/workspace.module'
import { PaymentService } from './services/payment.service'
import { PlanService } from './services/plan.service'
import { ProjectModule } from '../project/project.module'
import { PaymentProfile } from './profiles/payment.profile'
import { ProjectService } from '../project/services/project/project.service'
import { PAYMENT_REPOSITORY } from './repositories/payment-repository.interface'
import { PaymentRepository } from './repositories/payment.repository'

@Module({
  imports: [JwtModule, forwardRef(() => WorkspaceModule), forwardRef(() => ProjectModule)],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PlanService,
    PaymentProfile,
    { provide: PAYMENT_REPOSITORY, useClass: PaymentRepository }
  ],
  exports: [PlanService]
})
export class PaymentModule {}
