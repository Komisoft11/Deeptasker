import { MikroOrmModuleOptions as Options } from '@mikro-orm/nestjs'

const config: Options = {
	type: 'postgresql',
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT, 10) || 3307,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	dbName: process.env.DB_NAME,
	entities: ['dist/**/*.entity.js'],
	//entitiesTs: ['src/**/*.entity.ts'],
	// debug: true,
	registerRequestContext: false,
	discovery: {
		warnWhenNoEntities: false
	},
	autoLoadEntities: true,
	// debug: true
}
export default config