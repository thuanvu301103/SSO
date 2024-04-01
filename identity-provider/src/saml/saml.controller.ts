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
		console.log('Request session ID: ', req.sessionID);
		if (saml_request) {
			req.session.samlreq = saml_request;
			// Check if session stores username orr not, if yes
			if (req.session.user) res.redirect('/saml/dashboard');
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
	getdDashboard (@Res() res: Response, @Req() req: Request) {
		console.log('Request session ID: ', req.sessionID);
		return null;
	}

	@Get('logout')
	@Render('logout')
	getLogoutPage (@Res() res: Response,@Req() req: Request) {
		return {message: req.session.user};
	}

	@Post('logout')
	logOut (@Body('logout') logout: string, @Res() res: Response,@Req() req: Request) {
		// If logout value == yes then delete user info on thiss session
		if (logout == 'yes')
			req.session.user = null;
		res.redirect('/saml/dashboard');
	}
}
