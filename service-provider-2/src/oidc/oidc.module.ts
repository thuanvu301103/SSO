/*---SP2-OIDC---*/

import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { OidcController } from './oidc.controller';
import { OidcService } from './oidc.service';
// import middleware
import { OidcAuthMiddleware } from '../middleware/middleware.oidc.auth';
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
		// Apply AuthMiddleware to all routes within the AppModule
		// Whenever a user enters anypath, a session is created 

		consumer.apply(OidcAuthMiddleware)
			.exclude('/oidc/callback', '/oidc/logout', '/oidc/login')
			.forRoutes({ path: 'oidc*', method: RequestMethod.ALL });
	}
}
