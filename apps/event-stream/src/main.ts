import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WsAdapter } from '@nestjs/platform-ws'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const port = process.env.PORT || 5001

	app.useGlobalPipes(new ValidationPipe())

	app.useWebSocketAdapter(new WsAdapter(app))

	app.enableCors();

	await app.listen(port, () => {
		console.log(`WebSocket event consumer завелся на: ${port}`)
	})
}

bootstrap()
