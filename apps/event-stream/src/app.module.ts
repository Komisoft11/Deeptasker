import { Module } from '@nestjs/common'
import { EventService } from './events/event.service'
import { EventsModule } from './events/events.module'
import { AuthModule } from './auth/auth.module'
import { AutomapperModule } from '@automapper/nestjs'
import { ConfigModule } from '@nestjs/config'
import { WorkspaceService } from './workspace/workspace.service'
import { WorkspaceModule } from './workspace/workspace.module'
import { ProjectModule } from './project/project.module'
import { NotificationModule } from './notification/notification.module'
import { getAutomapperConfig } from './config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    AutomapperModule.forRoot(getAutomapperConfig()),
    AuthModule,
    EventsModule,
    WorkspaceModule,
    ProjectModule,
    NotificationModule
  ],
  providers: [EventService, WorkspaceService]
})
export class AppModule {}
