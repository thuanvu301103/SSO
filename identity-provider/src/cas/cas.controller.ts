/*---IdP-CAS---*/

import { Controller, Get, Post, Body, Render, Req, Res, Query } from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { CasService } from './cas.service'

@Controller('cas')
export class CasController {
	constructor(
		private readonly casService: CasService
	) { }

	@Get('login')
	@Render('login')
	getLoginPage(
		@Query('service') service: string,
		@Res() res: Response,
		@Req() req: Request
	) {

		// If this Get is redirect from SP then
		if (service) {
			req.session.org_service = service;
			if (req.cookies['logined-idp'] && req.cookies['username-idp']) {
				res.redirect('/cas/dashboard');
			}
		}
		// render Login page
		return { message: "CAS", option: "cas" };
	}

	// The user authenticate username and password
	@Post('login')
	autheticate(@Body('username') username: string, @Body('password') password: string, @Req() req: Request, @Res() res: Response) {
		// Retrieve variables from the request body		

		if (this.casService.authenticate(username, password)) {

			// set cookie
			res.cookie('logined-idp', true, { httpOnly: false });
			res.cookie('username-idp', username, { httpOnly: false });
			// set user session
			req.session.user = username;

			// redireact to dashboard
			res.redirect('/cas/dashboard');
		}
		else {
			res.redirect('/cas/login');
		}

	}

	// Dasshboard service
	@Get('dashboard')
	@Render('dashboard')
	getdDashboard(@Res() res: Response, @Req() req: Request) {
		//console.log('Request session ID: ', req.sessionID);
		return { message: req.cookies["username-idp"] };
	}

	@Get('serviceValidate')
	validateService(
		@Query('service') service: string,
		@Query('ticket') ticket: string
	) {
		console.log("---------- Validate Ticket: \n Org service: ", service, "\n Ticket ST: ", ticket);
		const username = this.casService.validateService(ticket);
		console.log("---------- Generate Validate XML Response: ");
		const XMLRes = this.casService.genXMLRes(username, ticket);
		console.log(XMLRes);
		return XMLRes;
	}

	@Get('logout')
	@Render('logout')
	getLogoutPage(@Res() res: Response, @Req() req: Request) {
		return { message: req.cookies["username-idp"], method: 'cas' };
	}

	@Post('logout')
	logOut(@Body('logout') logout: string, @Res() res: Response, @Req() req: Request) {
		// If logout value == yes then delete user info on thiss session
		if (logout == 'yes') {
			res.clearCookie("logined-idp");
			//console.log(req.cookies["logined"]);
			res.clearCookie("username-idp");
		}
		res.redirect('/cas/dashboard');
	}

}