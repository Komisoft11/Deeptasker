import { AuthModule } from '../auth/auth.module'
import { forwardRef, Logger, Module } from '@nestjs/common'
import { FileService } from './services/file.service'
import { FileController } from './file.controller'
import { TaskModule } from '../task/task.module'
import { S3Module } from 'nestjs-s3'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BucketService } from './services/bucket.service'
import { EventsModule } from '../events/events.module'
import { FILE_REPOSITORY } from './repositories/file-repository.interface'
import { FileRepository } from './repositories/file.repository'
import { ReportModule } from '../report/report.module'
import { ProjectModule } from '../project/project.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => TaskModule),
    EventsModule,
    forwardRef(() => ReportModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
    S3Module.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        config: {
          credentials: {
            accessKeyId: config.get('S3_ACCESS_KEY_ID'),
            secretAccessKey: config.get('S3_ACCESS_KEY')
          },
          region: config.get('S3_REGION') || 'default',
          endpoint: config.get('S3_ENDPOINT'),
          forcePathStyle: true,
          s3ForcePathStyle: true,
          s3DisableBodySigning: true,
          signatureVersion: 'v4'
          // logger: console
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [
    FileService,
    Logger,
    BucketService,
    { provide: FILE_REPOSITORY, useClass: FileRepository }
  ],
  controllers: [FileController],
  exports: [FileService]
})
export class FileModule {}
