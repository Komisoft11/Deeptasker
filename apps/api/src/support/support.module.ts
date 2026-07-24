import { Module } from '@nestjs/common'
import { SupportService } from './support.service'
import { SupportController } from './support.controller'
import { AuthModule } from '../auth/auth.module'
import { SupportProfile } from './profiles/support.profile'
import { FileModule } from '../file/file.module'

@Module({
  imports: [AuthModule, FileModule],
  controllers: [SupportController],
  providers: [SupportProfile, SupportService]
})
export class SupportModule {}
