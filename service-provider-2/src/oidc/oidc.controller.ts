/*---SP2-OIDC---*/

import { Controller, Get, Post, Body, Req, Res, Render, Query } from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { OidcService } from './oidc.service';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';


@Controller('oidc')
export class OidcController {

	constructor(
		private readonly oidcService: OidcService,
		private readonly jwtService: JwtService

	) { }

	private IdP_oidc_loginpage = 'http://127.0.0.1:3000/oidc/login';

	@Get('login')
	@Render('login')
	getLoginPage(
		@Res() res: Response,
		@Req() req: Request) {

		// If this Get is redirect from SP then save SAML resquest in session

		let redirect_link = this.IdP_oidc_loginpage + '?response_type=code&client_id=sp2&redirect_uri=http://127.0.0.1:3002/oidc/callback&scope=openid&state=random_state_value';
		//console.log("----------Redirect to IdP with SAML Login Request----------\n" + redirect_link, "\n");
		return { method: "OIDC", message: redirect_link };
	}

	@Get('callback')
	async processAuthorization(
		@Query('code') auth_code,
		@Query('state') state,
		@Res() res: Response,
		@Req() req: Request) {

		try {
			console.log("---------- Receive Authorization code: \n", auth_code);
			// Use axios to send a POST request with body and query parameters
			const response = await axios.post("http://127.0.0.1:3000/oidc/token",
				{
					clientId: "sp2",
					authCode: auth_code,
					clientSecret: null,
					redirectUri: null
				});
			// Save token to cookies
			console.log("---------- Receive Access Token: ---------- \n");
			console.log("Access Token: ", response.data['access_token']);
			console.log("ID Token: ", response.data['id_token']);

			res.cookie('access_token', response.data['access_token'], { httpOnly: false });
			res.cookie('id_token', response.data['id_token'], { httpOnly: false });

			let des_id_token = await this.jwtService.verifyAsync(response.data['id_token']);
			console.log("---------- Decrypt ID Token: ---------- \n", des_id_token);
			res.cookie('username-sp2', des_id_token['username'], { httpOnly: false });
			res.cookie('logined-sp2', true, { httpOnly: false });
			res.redirect('/oidc/dashboard');

		} catch (error) {
			// Handle error (e.g., log, throw custom error)
			throw new Error(`Failed to send POST request: ${error.message}`);
		}
	}

	@Get('dashboard')
	@Render('dashboard')
	getDas(@Req() req: Request) {
		return { message: req.cookies["username-sp2"] };
	}

	/*
	// First protected service
	@Get('rolelist')
	@Render('rolelist')
	getRoleList() {
		// call service
		let role_list = this.oidcService.getRoleList();
		return { message: role_list };
	}


	// Second protected service
	@Get('classlist')
	@Render('classlist')
	getClassList() {
		// call service
		let class_list = this.oidcService.getClassList();
		return { message: class_list };
	}
	*/

	@Get('logout')
	@Render('logout')
	getLogoutPage(@Res() res: Response, @Req() req: Request) {
		return { message: req.cookies["username-sp2"], method: 'oidc'};
	}

	@Post('logout')
	logOut(@Body('logout') logout: string, @Res() res: Response, @Req() req: Request) {
		// If logout value == yes then delete user info on thiss session
		if (logout == 'yes') {
			res.clearCookie("logined-sp2");
			//console.log(req.cookies["logined"]);
			res.clearCookie("username-sp2");
		}
		res.redirect('/oidc/dashboard');
	}

}
