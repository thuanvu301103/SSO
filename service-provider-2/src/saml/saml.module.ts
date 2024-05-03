// SP

import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import * as session from 'express-session';
import { SamlController } from './saml.controller';
import { SamlService } from './saml.service';
// import middleware
import { SamlAuthMiddleware } from '../middleware/middleware.saml.auth';

@Module({
	imports: [],
	controllers: [SamlController],
	providers: [SamlService]
})
export class SamlModule implements NestModule{
	configure(consumer: MiddlewareConsumer) {
    	// Apply AuthMiddleware to all routes within the AppModule
		consumer.apply(SamlAuthMiddleware)
			.exclude('/saml/asc', '/saml/logout', '/saml/login')
			.forRoutes({ path: 'saml*', method: RequestMethod.ALL });
  	}
}
