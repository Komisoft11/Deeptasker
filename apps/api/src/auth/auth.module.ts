import { forwardRef, Logger, Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './services/auth.service'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './strategies/jwt.strategy'
import { RefreshProfile } from './profiles/refresh.profile'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { WorkspaceModule } from '../workspace/workspace.module'
import { ProjectModule } from '../project/project.module'
import { AsyncJobModule } from '../async-job/async-job.module'
import { AUTH_REPOSITORY } from './repositories/auth-repository.interface'
import { AuthRepository } from './repositories/auth.repository'
import { VerificationModule } from '../verification/verification.module'
import { WORKSPACE_PERMISSIONS_REPOSITORY } from '../workspace/repositories/permissions/workspace-permissions-repository.interface'
import { WorkspacePermissionsRepository } from '../workspace/repositories/permissions/workspace-permissions-repository'
import { PROJECT_PERMISSIONS_REPOSITORY } from '../project/repositories/permissions/project-permissions-repository.interface'
import { ProjectPermissionsRepository } from '../project/repositories/permissions/project-permissions-repository'
import { NotificationModule } from '../notification/notification.module'

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    Logger,
    RefreshProfile,
    { provide: AUTH_REPOSITORY, useClass: AuthRepository },
    { provide: WORKSPACE_PERMISSIONS_REPOSITORY, useClass: WorkspacePermissionsRepository },
    { provide: PROJECT_PERMISSIONS_REPOSITORY, useClass: ProjectPermissionsRepository }
  ],
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN')
        }
      }),
      inject: [ConfigService]
    }),
    forwardRef(() => AsyncJobModule),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => VerificationModule),
    forwardRef(() => NotificationModule)
  ],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
