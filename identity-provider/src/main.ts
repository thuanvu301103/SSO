import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as session from 'express-session';


async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	/*
	app.enableCors({
    		origin: 'http://127.0.0.1:3001', // Allow requests from this origin
    		// Other CORS options can be configured here
  	});
	app.use(
  		session({
   		secret: 'vungocthuan1234',
    		resave: false,
    		saveUninitialized: true,
  		}),
	);*/
	app.useStaticAssets(join(__dirname, '..', 'public'));
  	app.setBaseViewsDir(join(__dirname, '..', 'views'));
  	app.setViewEngine('hbs');
  	await app.listen(3000);

}
bootstrap();
