import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as fs from 'fs';


async function bootstrap() {
    /*
    const httpsOptions = {
        key: fs.readFileSync('./cert.key'),
        cert: fs.readFileSync('./cert.crt'),
    };
    */
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: true,
        //httpsOptions,
    });
	app.useStaticAssets(join(__dirname, '..', 'public'));
  	app.setBaseViewsDir(join(__dirname, '..', 'views'));
  	app.setViewEngine('hbs');
  	await app.listen(3000);

}
bootstrap();
