/*---SP2-CAS---*/

import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CasController } from './cas.controller';
import { CasService } from './cas.service';
import { CasAuthMiddleware } from '../middleware/middleware.cas.auth';

@Module({
  controllers: [CasController],
  providers: [CasService]
})
export class CasModule {
    configure(consumer: MiddlewareConsumer) {
        // Apply AuthMiddleware to all routes within the AppModule
        consumer.apply(CasAuthMiddleware)
            .exclude('/cas', '/cas/logout', '/cas/login')
            .forRoutes({ path: 'cas*', method: RequestMethod.ALL });
    }
}
