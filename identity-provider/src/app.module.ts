import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SamlModule } from './saml/saml.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';


@Module({
  imports: [SamlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
configure(consumer: MiddlewareConsumer) {
    // Configure session middleware
    consumer
      .apply(cookieParser(), session({
        secret: 'your-secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false, // Set to true in production if using HTTPS
          httpOnly: true,
          sameSite: 'lax', // Adjust as needed
        },
      }))
      .forRoutes('*');

    // Configure CORS middleware
    consumer
      .apply(cors({
        origin: ['http://127.0.0.1:3000', 'http://127.0.0.1:3001'], // Allowed origins
        credentials: true, // Allow credentials (cookies)
      }))
      .forRoutes('*');
  }

}
