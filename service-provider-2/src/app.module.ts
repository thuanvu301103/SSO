import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SamlModule } from './saml/saml.module';
import { OidcModule } from './oidc/oidc.module';
import { CasModule } from './cas/cas.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';

@Module({
  imports: [SamlModule, OidcModule, CasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {

configure(consumer: MiddlewareConsumer) {
    // Configure session middleware
    consumer
        .apply(cookieParser(), session({
        secret: 'your-secret',
        resave: true,
        saveUninitialized: true,
        cookie: {
          secure: false, // Set to true in production if using HTTPS
          //httpOnly: true,
          sameSite: 'lax', // Adjust as needed
        },
      }))
      .forRoutes('*');

    // Configure CORS middleware
    consumer
      .apply(cors({
        origin: true, // Allowed origins
        credentials: true, // Allow credentials (cookies)
      }))
      .forRoutes('*');
  }

}
