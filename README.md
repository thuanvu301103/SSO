# SSO

## Getting started guide

### Flatform
We use NestJs, a back-end Javascript platform, to implement server. 

### Architecture
Since this project' aim is to implement SSO, we use MVC model as server's architecture pattern.

### Start Projects 
Use NestJS to set up 3 projects including indentity-provider, service-provider-1 and service-provider-2. These 3 projects is 3 server-sides that work as an SSO system.

### Install necessary dependencies
- ```npm uninstall @types/ty```
- ```npm install -D @types/express-session@1.17.0```
The reason why we need to do this is explain on website: ```https://dev.to/qoobes/express-session-failing-with-typescript-types-express-session-1ehk``` 
- ```npm install hbs```
- ```npm install xml2js```
- ```npm install zlib```

## Coding instructions

### Create database and services

#### Create database
- We want to keep everything as simple as possible so we jusst neeed to define a typescript file to hold variables and data.
- In each project, in the the ```src```, create a folder named ```schema```.
- For the Identity-provider, we neeed to store login data (password and username):
```javascript
\\ file: schema.logindata.ts
let login_data = [
	{ 
		username: "nguyenvana",
		password: "nguyenvana"
	},
	{
		username: "buithib",
		passsword: "buithib" 
	},
	{
		username: "chauvanc",
		password: "chauvanc"
	}
];
export {login_data};
```
- For Service-providers, we can add some attributes that attach to users:
```javascript
let user_data = [
	{ 
		username: "nguyenvana",
		role: "student",
		class: "12A"
	},
	{
		username: "buithib",
		role: "teacher",
		class: "12B"
	},
	{
		username: "chauvanc",
		role: "student",
		class: "12C"
	}
];
export {user_data};
```

#### Create services


### Create ```views``` folders. 
- Since we using MVC model, we need to create ```views``` module.
- The ```views``` folder should be in the same directory as ```src``` folder in each project (each server).
- The ```views``` folde contains ```hbs``` files which will be rendered later
```html
\\ file: views\login.hbs
<!-- login.hbs -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
</head>
<body>
    <h2>Login</h2>
    <form action="/login" method="POST">
        <div>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username">
        </div>
        <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password">
        </div>
        <button type="submit">Login</button>
    </form>
</body>
</html>
```

### Config Express instance
```javascript
\\ file: main.ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.useStaticAssets(join(__dirname, '..', 'public'));
  	app.setBaseViewsDir(join(__dirname, '..', 'views'));
  	app.setViewEngine('hbs');
  	await app.listen(3000);

}
bootstrap();
```

## Service provider

#### Implement middleware to check login status
- Middleware in web development is code that runs between the incoming request and the route handler (or controller action) in your application
- Purpose: whenever user enters a path that attachs to this middleware, if user has not logined the service provider, user will be redirect to login page in IdP.  

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
      			return res.redirect('http:127.0.0.1:3000/saml/login');
    		}
    		// If user has aldready logined, continue
    		next();
  	}
}
```
- ```NestMiddleware``` is an interface provided by NestJS that middleware classes can implement.
- When a class implements NestMiddleware, it must provide a ```use()``` method, which is the middleware logic that NestJS will execute for each incoming HTTP request.

### Apply auth middleware to every path
Purpose: whenever user enters any path, auth middleware will be active
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

### Apply middleware (create session middleware) to check if the user is logined or not
Purpose: whenever user enters any path off service provider, a session will be created.
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

## Identity provider

### Implement middleware to check login status
Purpose: whenever user enters a path that attachs to this middleware, if user has not logined the IdP, user will be redirect to login page in IdP.
```javascript
\\ file middleware.auth.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as path from 'path'; // Import path module to work with file paths

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		// Check whether user's information is in session or not. If no, redirect to login page
		if (!req.session || !req.session.user) {
      			res.redirect('/saml/login');	// The login page is in "http:127.0.0.1:3000/saml/login"
    		}
    		// If user has aldready logined, continue to the page 
    		next();
  	}
}
```

### Apply auth middleware to every path except login page
Purpose: whenever user enters any path, auth middleware will be active (exxcept login page)
```javascript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import * as session from 'express-session';
import { SamlController } from './saml.controller';
import { SamlService } from './saml.service';
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
		consumer
			.apply(AuthMiddleware)
			.exclude('/saml/login') 
			.forRoutes('*');
  	}
}
``` 

### Render

- Caution:
   + The example code has already apply middleware (create session middleware) to check if the user is logined or not too
   + ```.exclude('/saml/login')```: since we apply auth middleware to all path, this part of code is very important to avoid never-end loop redirect