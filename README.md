# SSO

## Install necessary dependencies
- ```npm uninstall @types/ty```
- ```npm install -D @types/express-session@1.17.0```
The reason why we need to do this is explain on website: ```https://dev.to/qoobes/express-session-failing-with-typescript-types-express-session-1ehk``` 

## Service provider

### Implement middlewares
Middleware in web development is code that runs between the incoming request and the route handler (or controller action) in your application

#### Implement middleware to check login status
```javascript
\\ file middleware.auth.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		// Check whether user's information is in session orr not
		if (!req.session || !req.session.user) {
      			// If not, redirect user to login page
      			return res.redirect('/login');
    		}
    		// If user has aldready logined, continue
    		next();
  	}
}
```
- ```NestMiddleware``` is an interface provided by NestJS that middleware classes can implement.
- When a class implements NestMiddleware, it must provide a ```use()``` method, which is the middleware logic that NestJS will execute for each incoming HTTP request.

* Apply middleware to every path
```javascript
\\ file: saml.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SamlController } from './saml.controller';
import { SamlService } from './saml.service';
// import Auth middleware
import { AuthMiddleware } from '../middleware/middleware.auth';

@Module({
	controllers: [SamlController],
	providers: [SamlService]
})
export class SamlModule implements NestModule{
	configure(consumer: MiddlewareConsumer) {
    	// Apply AuthMiddleware to all routes within the AppModule
    		consumer.apply(AuthMiddleware).forRoutes('*');
  	}
}
```
- ```NestModule``` is an interface provided by NestJS that modules can implement. It requires the implementation of a configure method, which is used to define how the module should be configured. Modules implementing NestModule can perform initialization tasks, set up providers, configure middleware, etc.
- ```MiddlewareConsumer``` is a class provided by NestJS that represents a builder for configuring middleware within a module. It provides methods for applying middleware to routes or groups of routes within the module. The MiddlewareConsumer is typically used within the configure method of a module that implements NestModule.
- ```configure``` method is a required method when a class implements the NestModule interface. It allows you to define how the module should be configured, including setting up middleware, defining providers, etc. The configure method receives a MiddlewareConsumer parameter, which is used to configure middleware for the module.
- ```consumer``` refers to the MiddlewareConsumer instance that is passed as a parameter to the configure method. You use the consumer object to apply middleware to routes or groups of routes within the module using methods like apply and forRoutes.

#### Apply middleware to check if the user is logined or not
```javascript
\\ file: saml.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import * as session from 'express-session';
import { SamlController } from './saml.controller';
import { SamlService } from './saml.service';
// import middleware
import { AuthMiddleware } from '../middleware/middleware.auth';

@Module({
	imports: [],
	controllers: [SamlController],
	providers: [SamlService]
})
export class SamlModule implements NestModule{
	configure(consumer: MiddlewareConsumer) {
    	// Apply AuthMiddleware to all routes within the AppModule
		// Whenever a user enters anypath, a session is created 
		consumer.apply(
			session({
				secret: 'vungocthuan1234',
				resave: false,
				saveUninitialized: false,
				cookie: {secure: false}
			})
		).forRoutes('*');
		
		consumer.apply(AuthMiddleware).forRoutes('*');
  	}
}

```