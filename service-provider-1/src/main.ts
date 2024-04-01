import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';


async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	/*
	app.enableCors({
    		origin: 'http://127.0.0.1:3000', // Allow requests from this origin
    		// Other CORS options can be configured here
  	});
	*/
	app.useStaticAssets(join(__dirname, '..', 'public'));
  	app.setBaseViewsDir(join(__dirname, '..', 'views'));
  	app.setViewEngine('hbs');
  	await app.listen(3001);

}
bootstrap();
