import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { TaskModule } from './task/task.module'
import { AutomapperModule } from '@automapper/nestjs'
import { classes } from '@automapper/classes'
import { ProjectModule } from './project/project.module'
import { FileModule } from './file/file.module'
import { TaskPlanModule } from './task-plan/task-plan.module'
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n'
import { EventsModule } from './events/events.module'
import path from 'path'
import database from './database'
import { ObjectionModule } from '@squareboat/nestjs-objection'
import { WorkspaceModule } from './workspace/workspace.module'
import { AsyncJobModule } from './async-job/async-job.module'
import { PaymentModule } from './payment/payment.module'
import { FolderModule } from './folder/folder.module'
import { ReportModule } from './report/report.module'
import { VerificationModule } from './verification/verification.module'
import { SprintModule } from './sprint/sprint.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { cacheRedisModule } from './cache/cacheRedisModule'
import { PrometheusModule } from '@willsoto/nestjs-prometheus'
import { MetricsModule } from './metrics/metrics.module'
import { HealthModule } from './health/health.module'
import { NotificationModule } from './notification/notification.module'
import { PoliciesModule } from './policies/policies.module'
import { SupportModule } from './support/support.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      expandVariables: true,
      load: [database]
    }),
    ObjectionModule.registerAsync({
      imports: [ConfigService],
      useFactory: (config: ConfigService) => {
        return config.get('database')
      },
      inject: [ConfigService],
      isGlobal: true
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes()
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true
      },
      resolvers: [AcceptLanguageResolver]
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'assets'),
      exclude: ['/api*']
    }),
    PrometheusModule.register(),
    cacheRedisModule,
    UserModule,
    AuthModule,
    TaskModule,
    ProjectModule,
    AsyncJobModule,
    FileModule,
    TaskPlanModule,
    EventsModule,
    WorkspaceModule,
    PaymentModule,
    FolderModule,
    VerificationModule,
    ReportModule,
    SprintModule,
    MetricsModule,
    HealthModule,
    PoliciesModule,
    SupportModule,
    NotificationModule
  ],
  controllers: []
})
export class AppModule {}
