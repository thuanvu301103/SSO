/*---IdP-OIDC---*/

import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { OidcController } from './oidc.controller';
import { OidcService } from './oidc.service';
import { AuthMiddleware } from '../middleware/middleware.oidc';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule from @nestjs/jwt


@Module({
	imports: [JwtModule.register({
		secret: 'vungocthuan', // Provide a valid secret key
		/*
		signOptions: {
			expiresIn: '1h', // Optional: Set token expiration time
			algorithm: 'HS256' // Specify the algorithm explicitly
		},*/
	})], // Optionally, you can provide configuration here
	controllers: [OidcController],
	providers: [OidcService]
})
export class OidcModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(AuthMiddleware)
			.exclude('/oidc/login', '/oidc/logout', '/oidc/token')
			.forRoutes({ path: 'oidc*', method: RequestMethod.ALL });
	}

}
