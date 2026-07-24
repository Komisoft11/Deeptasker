import { Module } from '@nestjs/common'
import { GeneratorCommand } from './commands/generator.command'
import { ConfigModule, ConfigService } from '@nestjs/config'
import database from '../database'
import { ObjectionModule } from '@squareboat/nestjs-objection'
import { ProjectGeneratorService } from './services/project-generator.service'
import { ConsoleService } from './services/console.service'
import { ProjectModule } from '../project/project.module'
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n'
import path from 'path'
import { AutomapperModule } from '@automapper/nestjs'
import { classes } from '@automapper/classes'
import { TaskModule } from '../task/task.module'
import { FileModule } from '../file/file.module'
import { FilesizerCommand } from './commands/filesizer.command'

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
				const settings = config.get('database')
				settings.connections.postgres.debug = !!+config.get('DB_COMMAND_DEBUG')
				return settings
			},
			inject: [ConfigService],
			isGlobal: true
		}),
		I18nModule.forRoot({
			fallbackLanguage: 'en',
			loaderOptions: {
				path: path.join(__dirname, '../i18n/'),
				watch: true
			},
			resolvers: [AcceptLanguageResolver]
		}),
		AutomapperModule.forRoot({
			strategyInitializer: classes()
		}),
		ProjectModule,
		TaskModule,
		FileModule
	],
	providers: [GeneratorCommand, FilesizerCommand, ProjectGeneratorService, ConsoleService]
})
export class CommandModule {}
