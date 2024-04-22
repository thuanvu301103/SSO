/*---IdP---*/

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
		console.log('----------Access IdP login page----------\n');
		
		if (saml_request) {
			console.log("Extract SAML Request: \n", saml_request, "\n");
			req.session.samlreq = saml_request;
			// Check if session stores username orr not, if yes
			//if (req.session.user) res.redirect('/saml/dashboard');
			if (req.cookies['logined-idp'] && req.cookies['username-idp']) {

				res.redirect('/saml/dashboard');
			}

		}
		// render Login page
		return {message: "SAML"};
	}
	
	// The user authenticate username and password
	@Post('login')
	autheticate(@Body('username') username: string, @Body('password') password: string, @Req() req: Request,  @Res() res: Response) {
		// Retrieve variables from the request body		
		
		if (this.samlService.authenticate(username, password)) {
			console.log('Authentication credentials in IdP: approve \n');
			// set cookie
			console.log("Save login data in session cookie \n")
			res.cookie('logined-idp', true, { httpOnly: false });
			res.cookie('username-idp', username, { httpOnly: false });
			// set user session
			req.session.user = username;
			//console.log("Session ID after authentication: ", req.session.id);
			//console.log("Cookie Session after authentication: ", req.cookies['logined']);
			// redireact to dashboard
			res.redirect('http://127.0.0.1:3000/saml/dashboard');
		}
		else {
			console.log('Authentication credentials in IdP: deny \n ---------- Retry\n');
			res.redirect('/saml/login');
		}
			
	}
	
	// Dasshboard service
	@Get('dashboard')
	@Render('dashboard')
	getdDashboard (@Res() res: Response, @Req() req: Request) {
		//console.log('Request session ID: ', req.sessionID);
		return { message: req.cookies["username-idp"] };
	}

	@Get('logout')
	@Render('logout')
	getLogoutPage (@Res() res: Response,@Req() req: Request) {
		return { message: req.cookies["username-idp"] };
	}

	@Post('logout')
	logOut (@Body('logout') logout: string, @Res() res: Response,@Req() req: Request) {
		// If logout value == yes then delete user info on thiss session
		if (logout == 'yes') {
			res.clearCookie("logined-idp");
			//console.log(req.cookies["logined"]);
			res.clearCookie("username");
		}
		console.log(req.cookies["logined-idp"]);
		res.redirect('/saml/dashboard');
	}
}
