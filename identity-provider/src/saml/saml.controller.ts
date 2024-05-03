/*---IdP-SAML---*/

import { Controller, Get, Post, Body, Render, Req, Res, Query} from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { SamlService } from './saml.service'

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
		@Req() req: Request)
	{
		// If this Get is redirect from SP then save SAML resquest in session
		if (saml_request) {
			req.session.samlreq = saml_request;
			// Check if session stores username orr not, if yes
			if (req.cookies['logined-idp'] && req.cookies['username-idp']) {
				res.redirect('/saml/dashboard');
			}

		}
		// render Login page
		return {message: "SAML", option: "saml"};
	}
	
	// The user authenticate username and password
	@Post('login')
	autheticate(@Body('username') username: string, @Body('password') password: string, @Req() req: Request,  @Res() res: Response) {
		// Retrieve variables from the request body	
		if (this.samlService.authenticate(username, password)) {
			// set cookie
			res.cookie('logined-idp', true, { httpOnly: false });
			res.cookie('username-idp', username, { httpOnly: false });
			// set user session
			req.session.user = username;
			// redireact to dashboard
			res.redirect('/saml/dashboard');
		}
		else {
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
		return { message: req.cookies["username-idp"], method: 'saml'};
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
