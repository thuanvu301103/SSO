/*---IdP-OIDC---*/

import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { OidcController } from './oidc.controller';
import { OidcService } from './oidc.service';
import { AuthMiddleware } from '../middleware/middleware.oidc';

@Module({
  controllers: [OidcController],
  providers: [OidcService]
})
export class OidcModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(AuthMiddleware)
			.exclude('/oidc/login', '/oidc/logout')
			.forRoutes({ path: 'oidc*', method: RequestMethod.ALL });
	}

}
