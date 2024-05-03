/*---IdP-CAS---*/

import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CasController } from './cas.controller';
import { CasService } from './cas.service';
import { AuthMiddleware } from '../middleware/middleware.cas';

@Module({
    controllers: [CasController],
    providers: [CasService]
})
export class CasModule {
    configure(consumer: MiddlewareConsumer) {
        // Apply AuthMiddleware to all routes within the AppModule
        consumer.apply(AuthMiddleware)
            .exclude('/cas/serviceValidate', '/cas/logout', '/cas/login')
            .forRoutes({ path: 'cas*', method: RequestMethod.ALL });
    }
}
