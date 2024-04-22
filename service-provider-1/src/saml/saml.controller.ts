// SP

import { Controller, Get, Post, Body, Req, Res, Render, Query } from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { SamlService } from './saml.service';
import * as session from 'express-session';

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
		@Req() req: Request) {

		// If this Get is redirect from SP then save SAML resquest in session
		console.log('----------Access SP-1 login page----------\n');

		let redirect_link = this.IdP_saml_loginpage + '?SAMLRequest=' + this.samlService.generateSamlRequest();
		//console.log("----------Redirect to IdP with SAML Login Request----------\n" + redirect_link, "\n");
		return { message: redirect_link };
	}

	@Get('asc')
	async getAsc(
		@Res() res: Response,
		@Req() req: Request,
		@Query ('SAMLResponse') saml_response: string 
	) {
		console.log("----------Receive SAMLResponse from IdP----------\n");
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
			console.log("Save login data in session cookie \n")
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
	
	// First protected service
	@Get('rolelist')
	@Render('rolelist')
	getRoleList() {
		// call service
		let role_list = this.samlService.getRoleList();
		return {message: role_list};
	}
	
	
	// Second protected service
	@Get('classlist')
	@Render('classlist')
	getClassList() {
		// call service
		let class_list = this.samlService.getClassList();
		return {message: class_list};
	}	

	@Get('logout')
	@Render('logout')
	getLogoutPage (@Res() res: Response,@Req() req: Request) {
		return { message: req.cookies["username-sp1"]};
	}

	@Post('logout')
	logOut (@Body('logout') logout: string, @Res() res: Response,@Req() req: Request) {
		// If logout value == yes then delete user info on thiss session
		if (logout == 'yes') {
			res.clearCookie("logined-sp1");
			//console.log(req.cookies["logined"]);
			res.clearCookie("username-sp1");
		}
		res.redirect('/saml/dashboard');
	}
}
