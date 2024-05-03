/*---SP1-SAML---*/

import { Controller, Get, Post, Body, Req, Res, Render, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { SamlService } from './saml.service';

@Controller('saml')
export class SamlController {

	constructor(
		private readonly samlService: SamlService
	) { }

	private IdP_saml_loginpage = 'http://127.0.0.1:3000/saml/login';

	@Get('login')
	@Render('login')
	getLoginPage(
		@Res() res: Response,
		@Req() req: Request
	) {
		let redirect_link = this.IdP_saml_loginpage + '?SAMLRequest=' + this.samlService.generateSamlRequest();
		return { method: "SAML", message: redirect_link };
	}

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
			// Save cookie
			res.cookie('logined-sp1', true, { httpOnly: false });
			res.cookie('username-sp1', username, { httpOnly: false });
			req.session.user = username;
			
			res.redirect('dashboard');
			
		} else {
			return null;
		}
	}
	
	// Incase user want to login to the system
	@Get('login')
	getLogin(@Res() res: Response) {
		// Redirect to dashboard if user has aldready been authenticated
		res.redirect('/dashboard');
	}

	@Get('dashboard')
	@Render('dashboard')
	getDas (@Req() req: Request) {
		return {message: req.cookies["username-sp1"]};
	} 
	
	
	@Get('logout')
	@Render('logout')
	getLogoutPage (@Res() res: Response,@Req() req: Request) {
		return { message: req.cookies["username-sp1"], method: 'saml'};
	}

	@Post('logout')
	logOut (@Body('logout') logout: string, @Res() res: Response,@Req() req: Request) {
		// If logout value == yes then delete user info on thiss session
		if (logout == 'yes') {
			res.clearCookie("logined-sp1");
			res.clearCookie("username-sp1");
		}
		res.redirect('/saml/dashboard');
	}
}
