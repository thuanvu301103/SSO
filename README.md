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

### Initial for all server

#### Create database
- We want to keep everything as simple as possible so we jusst neeed to define a typescript file to hold variables and data.
- In each project, in the the ```src```, create a folder named ```schema```.
- For the Identity-provider, we neeed to store login data (password and username):
```javascript
// file: schema.logindata.ts
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
// file: schema.userdata.ts
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

#### Create ```views``` folders. 
- Since we using MVC model, we need to create ```views``` module.
- The ```views``` folder should be in the same directory as ```src``` folder in each project (each server).
- The ```views``` folde contains ```hbs``` files which will be rendered later.
- Example for a ```hbs``` file:
```html
// file: views\login.hbs
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

#### Config Express instance to render ```hbs``` views
```javascript
// file: main.ts
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
- Caution: this project is running on the localhost (on your computer) so these servers must run on different ports:
   + Identity-provider runs on port 3000
   + Service-provider-1 runs on port 3001
   + Service-provider-2 runs on port 3002
- Change port number inside ```await app.listen(3000);```

#### Sub-modules
- The idea of this project is to implement more than one SSO method
- Using nestJS to create module in each server
- The next instructions is used to implement SAML SSO method

### Service-provider side

#### Create services endpoints
- These services need to be protected
- Controller:
```javascript
// file: saml/saml.controller.ts
export class SamlController {
	constructor(private readonly samlService: SamlService) { }	 
	
	// Incase user want to login to the system
	@Get('login')
	getLogin(@Res() res: Response) {
		// Redirect to dashboard if user has aldready been authenticated
		res.redirect('/dashboard');
	}

	@Get('dashboard')
	@Render('dashboard')
	getDas (@Req() req: Request) {
		return {message: req.session.user};
	}

	
	@Get('rolelist')
	@Render('rolelist')
	getRoleList() {
		// call service
		let role_list = this.samlService.getRoleList();
		return {message: role_list};
	}
	
	
	@Get('classlist')
	@Render('classlist')
	getClassList() {
		// call service
		let class_list = this.samlService.getClassList();
		return {message: class_list};
	}	
}
```
- Service:
```javascript
// file: saml/saml.service.ts
import { Injectable } from '@nestjs/common';
import { user_data } from '../schema/schema.userdata';	// Import user-data from schema 

@Injectable()
export class SamlService {

	// First protected service: get role-list
	public getRoleList() {
		let result = [];
		for (let i in user_data) {
			result.push({user: user_data[i].username, role: user_data[i].role});
		} 
		return result;
	}

	// Second protected service: get class-list
	public getClassList() {
		let result = [];
		for (let i in user_data) {
			result.push({user: user_data[i].username, class: user_data[i].class});
		} 
		return result;
	}
}
```
- hbs views
```hbs
<!-- dashboard.hbs -->

<!DOCTYPE html>
<html lang="en">
<head>
    	<meta charset="UTF-8">
    	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    	<title>Dashboard</title>
</head>
<body>
    	<h2>Welcome {{message}}</h2>
</body>
</html>

<!-- rolelist.hbs -->

<!DOCTYPE html>
<html lang="en">
<head>
    	<meta charset="UTF-8">
    	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    	<title>Role list</title>
</head>
<body>
    	<h2>Role list</h2>
	<ul>
  		{{#each message}}
    			<li>user: {{user}} - role: {{role}}</li>
  		{{/each}}
	</ul>
</body>
</html>

<!-- classlist.hbs -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class list</title>
</head>
<body>
    	<h2>Class list</h2>
	<ul>
  		{{#each message}}
    			<li>user: {{user}} - class: {{class}}</li>
  		{{/each}}
	</ul>

</body>
</html>
```

#### Implement middleware check user's login status in SP
- Middleware in web development is code that runs between the incoming request and the route handler (or controller action) in your application
- Purpose: whenever user enters a path that attachs to this middleware, if user has not logined the service provider, user will be redirect to login page in IdP with SAML Request binded to URL.  
- If this senerio happens, we need to generate SAML Request first:
```javascript
import { Injectable } from '@nestjs/common';
import * as zlib from 'zlib'; // Import zlib for compression
import * as xml2js from 'xml2js'; // Import xml2js properly
import { user_data } from '../schema/schema.userdata';	// Import user-data form schema

@Injectable()
export class SamlService {

	// Generate SAML Request to send to IdP - compress XML to bind to URL later
	public generateSamlRequest(): string {
    		// Construct the SAML authentication request XML
    		const samlRequest = 
			`<samlp:AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:protocol" ID="1234" Version="2.0" IssueInstant="2024-03-24T12:00:00Z" Destination="http://127.0.0.1:3000/saml/login"	AssertionConsumerServiceURL = "http://127.0.0.1:3001/saml/asc" ProtocolBinding = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
    			<Issuer>http://127.0.0.1:3001</Issuer>
    			<NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
    			<!-- Any additional elements or attributes required by your IdP -->
			</samlp:AuthnRequest>`;
		
		// Compress the XML payload
        	//const compressedXml = zlib.deflateSync(encodedRequest);
		const compressedXml = zlib.deflateSync(samlRequest);
	
		// Encode the XML string
    		const encodedRequest = Buffer.from(compressedXml).toString('base64');

		return encodedRequest;
  	}
}
```
- Implement middleware:
```javascript
// file middleware/middleware.saml.auth.ts
import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SamlService } from '../saml/saml.service';

@Injectable()
export class SamlAuthMiddleware implements NestMiddleware {
	constructor(private readonly samlService: SamlService) {}	
	
	const IdP_saml_loginpage = 'http://127.0.0.1:3000/saml/login';

	use(@Req() req: Request, @Res() res: Response, next: NextFunction) {
		// Check whether user's information is in session or not
		console.log('\nOn accessing to SP's service: Session-username = ', req.session.user);
	
		if (!req.session || !req.session.user) {
      		// If not, redirect user to login page

			// Binding SAML Request to redirect link
			let redirect_link = IdP_saml_loginpage + '?SAMLRequest=' + this.samlService.generateSamlRequest();
			console.log("\nRedirect to IdP link: " + redirect_link);   
      			res.redirect(redirect_link);
    		}
    		// If user has aldready logined, continue to access services	
    		next();
  	}
}
```
Caution:
   + ```NestMiddleware``` is an interface provided by NestJS that middleware classes can implement.
   + When a class implements NestMiddleware, it must provide a ```use()``` method, which is the middleware logic that NestJS will execute for each incoming HTTP request.

- Apply auth middleware to paths (Config SAML module)
Purpose: whenever user enters any path (start with ```http://127.0.0.1:3001/saml/...``` and except for ```http://127.0.0.1:3001/saml/asc```), auth middleware will be active
```javascript
// file: saml/saml.module.ts
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
		// Whenever a user enters anypath, a session is created 
		consumer.apply(
			session({
				secret: 'vungocthuan1234',
				resave: false,
				saveUninitialized: false,
				cookie: {secure: false}
			})
		).forRoutes({ path: 'saml*', method: RequestMethod.ALL });
		consumer.apply(SamlAuthMiddleware)
			.exclude('/saml/asc')
			.forRoutes({ path: 'saml*', method: RequestMethod.ALL });
  	}
}
```
Caution:
   + ```NestModule``` is an interface provided by NestJS that modules can implement. It requires the implementation of a configure method, which is used to define how the module should be configured. Modules implementing NestModule can perform initialization tasks, set up providers, configure middleware, etc.
   + ```MiddlewareConsumer``` is a class provided by NestJS that represents a builder for configuring middleware within a module. It provides methods for applying middleware to routes or groups of routes within the module. The MiddlewareConsumer is typically used within the configure method of a module that implements NestModule.
   + ```configure``` method is a required method when a class implements the NestModule interface. It allows you to define how the module should be configured, including setting up middleware, defining providers, etc. The configure method receives a MiddlewareConsumer parameter, which is used to configure middleware for the module.    
   + ```consumer``` refers to the MiddlewareConsumer instance that is passed as a parameter to the configure method. You use the consumer object to apply middleware to routes or groups of routes within the module using methods like apply and forRoutes.

### Implement asc enpoint
- This endpoint is ussed to receive SAML Response from SP after user's authentication in IdP site
- If SP receive SAML Response, it will store in session usrename, and uses that session nfo to maintain login in SP
```typescript
// file: saml/saml.controller.ts
	@Get('asc')
	async getAsc(
		@Res() res: Response,
		@Req() req: Request,
		@Query ('SAMLResponse') saml_response: string 
	) {
		if (saml_response) {
			let username = null;
			await this.samlService.decodeAndParseSamlResponse(saml_response)
				.then((jsonResponse) => {
        				// Handle the jsonResponse containing the extracted data
					username = jsonResponse['username'];
        				console.log(jsonResponse);
    				})
    				.catch((error) => {
        				// Handle any errors that occurred during decoding and parsing
        				console.error(error);
    				});
			//console.log('Decode SAML req from SP got: ', decode_res_result.resolve['username']);
			// Save username
			req.session.user = username;
			
			res.redirect('dashboard');
			
		} else {
			return null;
		}
	}
``` 

### Implement Logout service

## Identity provider

### Decode SAML Request sent from SP
```typescript
import { Injectable } from '@nestjs/common';
import { login_data } from '../schema/schema.logindata'
import * as xml2js from 'xml2js'; // Import xml2js properly
import * as zlib from 'zlib'; // Import zlib for decompression

@Injectable()
export class SamlService {

	// decode SAML requesst message
	public decodeAndParseSamlRequest(encodedRequest: string): Promise<any> {
    		try {
			// Log encoded request
			console.log('\nEncoded SAML request sent from SP: ', encodedRequest);
			
			encodedRequest = encodedRequest.replace(/ /g, '+');
			const decodedRequest = Buffer.from(encodedRequest, 'base64');

			// Decompress the decoded data
    			const decompressedXml = zlib.inflateSync(decodedRequest);

    			// Convert the decompressed data to a string
    			const samlRequest = decompressedXml.toString('utf-8');
			
        		// Log decoded request
        		//console.log('\nDecoded SAML request sent from SP: \n', decodedRequest);
			console.log('\nDecoded SAML request sent from SP: \n', samlRequest);

        		// Parse the XML
        		const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
        		return new Promise((resolve, reject) => {
            			parser.parseString(samlRequest, (err, result) => {
                			if (err) {
                    				console.error('Error parsing SAML request XML:', err);
                    				reject(err); // Reject if parsing fails
                			} else {
                    				// Extract necessary information
                    				const samlRequest = result['samlp:AuthnRequest'];
                    				const requestId = samlRequest['ID'];
                    				const issuer = samlRequest['Issuer'];
                    				//const nameId = samlRequest['saml:Subject']['saml:NameID']['_'];
                    				const assertionConsumerServiceURL = samlRequest['AssertionConsumerServiceURL'];

                    				// Construct JSON object with extracted information
                    				const jsonRequest = {
                        				requestId: requestId,
                        				issuer: issuer,
                        				/*nameId,*/
                        				assertionConsumerServiceURL: assertionConsumerServiceURL
                        				// Add more fields as needed
                    				};

                    				// Resolve with the JSON object
                    				resolve(jsonRequest);
                			}
            			});
        		});
    		} catch (error) {
        		console.error('Error decoding SAML request:', error);
        		return Promise.reject(error);
    		}
	}
}
```

### Implement middleware to check login status
Purpose: whenever user enters a path that attachs to this middleware, if user has not logined the IdP, user will be redirect to login page in IdP.
```javascript
// file middleware.auth.ts
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
Purpose: whenever user enters any path, auth middleware will be active (except login page and logout page)
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
			.exclude('/saml/login', '/saml/logout') 
			.forRoutes('*');
  	}
}
``` 

### Implement Login service
- Purpose: The user will be redirected to login service in 3 senerio
   + The user request services in SP, but they have not logined yet, they will be redirected to login page of IdP wwith SAML Request
   + The user request service in IdP but not logined yet
   + The user request login service directly from IdP
- Authenticate username and password service:
```typescript
// file: saml/saml.service.ts
	public authenticate (user_name: string, pass_word: string) {
		console.log("Input: " + user_name + " - " + pass_word);
		let result = false
		for (let i in login_data) {
			if (user_name == login_data[i].username && pass_word == login_data[i].password) {	
				return true;
			}
		}
		return false; 
	}
```
- Controller:
```typescript
// file: saml/saml.controller.ts
// IdP

import { Controller, Get, Post, Body, Redirect, Render, Req, Res, Query} from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { SamlService } from './saml.service'
import * as session from 'express-session';
import { AuthMiddleware } from '../middleware/middleware.auth';

@Controller('saml')
export class SamlController { 
	constructor(
		private readonly samlService: SamlService
	) { }  	

    	@Get('login')
	@Render('login')
	getLoginPage (
		@Query ('SAMLRequest') saml_request: string,	// Handle SAML request sent from SP after authenticate them in IdP
		@Res() res: Response,
		@Req() req: Request) {
		// If this Get is redirect from SP then save SAML resquest in session
		if (saml_request) {
			req.session.samlreq = saml_request;
		}
		// render Login page
		return {message: "SAML"};
	}
	
	// The user authenticate username and password
	@Post('login')
	autheticate(@Body('username') username: string, @Body('password') password: string, @Req() req: Request,  @Res() res: Response) {
    		// Retrieve variables from the request body		    	
		if (this.samlService.authenticate(username, password)) {
			console.log('Authentication in IdP: approve');
			// set user session
			req.session.user = username;
			// redireact to dashboard
			res.redirect('/saml/dashboard');	
		} 
		else res.redirect('/saml/login');
	}
	
	// Dasshboard service
	@Get('dashboard')
	@Render('dashboard')
	getdDashboard () {
		return null;
	}
}
``` 
- If the user has been authenticated, redirect them to dashboard

### Re-implement middleware to check login status
If this login action comes from SP, then IdP must return SAML Response to SP. In the previous part, after user's authentication, they will be redirect dasshboard. Instead, they can be redirected back to SP asc with SAML Response. This action can be achived by extended Authenticate Middleware
```typescript
// file: middle/middle.auth.ts
	async use(req: Request, res: Response, next: NextFunction) {

		// Check whether user's information is in session or not. If no, redirect to login page
		console.log("\nOn accessing to IdP: Session-user: " + req.session.user);
	
		if (!req.session || !req.session.user) {
			console.log("\nRedirect user to login page.");
      			res.redirect('/saml/login');
    		}

    		// If user has aldready logined
		let ascServiceURL: string;
		let requestId: string;
		// If the request is from SP then redirect back to SP
		if (req.session.samlreq) {
			await this.samlService.decodeAndParseSamlRequest(req.session.samlreq)
				.then((jsonResponse) => {
        				// Handle the jsonResponse containing the extracted data
					ascServiceURL = jsonResponse.assertionConsumerServiceURL;
					console.log('Asc 1: ', ascServiceURL);
					requestId = jsonResponse.requestId;
        				console.log('Json Response: ', jsonResponse.assertionConsumerServiceURL);
    				})
    				.catch((error) => {
        				// Handle any errors that occurred during decoding and parsing
        				console.error(error);
    				});
			//console.log('Decode SAML req from SP got: ' + decode_req_result.toString());
			let decode_res_result = this.samlService.generateSamlResponse(
				requestId,
				ascServiceURL,
				req.session.user				 
			);
			// reley from browser to SP
			console.log('Asc: ', ascServiceURL);
			let redirect_link = ascServiceURL + '?SAMLResponse=' + decode_res_result;
			console.log("Redirect link: " + redirect_link);   
      			res.redirect(redirect_link);
		}
    		next();
  	}
```

### Encode SAML Response
```typescript
// file: saml/saml.service.ts
	public generateSamlResponse(requestId: string, assertionConsumerServiceURL: string, user: string): string {
    		// Construct the SAML response XML
    		const samlResponse = 
			`<samlp:AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:protocol" ID="5678" InResponseTo="${requestId}" Version="2.0" IssueInstant="2024-03-24T12:00:03Z" Destination="${assertionConsumerServiceURL}">
    				<Issuer>http://127.0.0.1:3000</Issuer>
				<samlp:Status>
        				<samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    				</samlp:Status>
				<saml:Assertion ID="assertion5678" Version="2.0" IssueInstant="2024-03-24T12:00:03Z" xmlns="urn:oasis:names:tc:SAML:2.0:assertion">
        				<saml:Issuer>http://127.0.0.1:3000</saml:Issuer>
        				<saml:Subject>
            					<saml:NameID>${user}</saml:NameID>
        				</saml:Subject>
        				<saml:Conditions NotBefore="2024-03-25T08:00:00Z"
                         				NotOnOrAfter="2024-03-25T08:05:00Z"/>
        				<saml:AuthnStatement AuthnInstant="2024-03-25T08:00:00Z">
            					<saml:AuthnContext>
                					<saml:AuthnContextClassRef>
                    						urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
                					</saml:AuthnContextClassRef>
           	 				</saml:AuthnContext>
        				</saml:AuthnStatement>
    				</saml:Assertion>
    				<NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
    				<!-- Any additional elements or attributes required by your IdP -->
			</samlp:AuthnRequest>`;
		
		// Log SAML Response
		console.log("Generate SAML Response: ", samlResponse);
		
		// Compress the XML payload
		const compressedXml = zlib.deflateSync(samlResponse);
	
		// Encode the XML string
    		const encodedResponse = Buffer.from(compressedXml).toString('base64');

		return encodedResponse;
  	}
```

### Implement Logout Service
- Controller:
```typescript
// file: saml/saml.controller.ts

	@Get('logout')
	@Render('logout')
	getLogoutPage (@Res() res: Response,@Req() req: Request) {
		return {message: req.session.user};
	}
	
	@Post('logout')
	logOut (@Body('logout') logout: string, @Res() res: Response,@Req() req: Request) {
		// If logout value == yes then delete user info on thiss session
		if (logout == 'yes') req.session.user = null;
		res.redirect('saml/dashboard');
	}
```
- hbs views render:
```html
<!-- logout.hbs -->

<!DOCTYPE html>
<html lang="en">
<head>
    	<meta charset="UTF-8">
    	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    	<title>Logout</title>
</head>
<body>
    	<h2>Logout from IdP</h2>
    	Are you sure you wwant to logout user: {{message}}
	<form action="http://127.0.0.1:3000/saml/logout" method="POST">
    		<button type="submit" name="logout" value="yes">Yes</button>
    		<button type="submit" name="logout" value="no">No</button>
	</form>
</body>
</html>
```


## Appendix
### Kill process (server) running on specific port:
- Find PID of server running on port:
```
netstat -ano | findstr :<Port number>
```
- Kill that process:
``` 
taskkill /F /PID <PID>
```