/*---IdP-OIDC---*/

import { Controller, Get, Post, Body, Render, Req, Res, Query, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { OidcService } from './oidc.service';


@Controller('oidc')
export class OidcController {
	constructor(
		private readonly oidcService: OidcService
	) { }


	/*
	 * Ẽample Login with query: http://127.0.0.1:3000/oidc/login?response_type=aaa&client_id=bbb&redirect_uri=ccc&scope=ddd&state=ddd
	 */
	@Get('login')
	@Render('login')
	getLoginPage(
		@Query('response_type') response_type: string,	// Expected Type of Response
		@Query('client_id') client_id: string,
		@Query('redirect_uri') redirect_uri: string,	// The URI to which the IdP will redirect user after successful authentication
		@Query('scope') scope: string,	// The requested scopes that the web application is asking the IdP to grant access to
		@Query('state') state: string,
		@Res() res: Response,
		@Req() req: Request) {

		// If this Get is redirect from SP
		
		if (Object.keys(req.query).length > 0) {
			req.session.queries = req.query;
			//console.log("Queris: ", req.session.queries);
			// Check if session stores username orr not, if yes
			if (req.cookies['logined-idp'] && req.cookies['username-idp']) {

				res.redirect('/oidc/dashboard');
			}

		}
		// render Login page
		return { message: "OpenID Connect", option: "oidc"};
	}

	// The user authenticate username and password
	@Post('login')
	async autheticate(
		@Body('username') username: string,
		@Body('password') password: string,
		@Req() req: Request,
		@Res() res: Response)
	{
		// Retrieve variables from the request body		
		const userid = await this.oidcService.authenticate(username, password);
		if (userid) {

			// set cookie

			res.cookie('logined-idp', true, { httpOnly: false });
			res.cookie('username-idp', username, { httpOnly: false });
			res.cookie('userid-idp', userid, { httpOnly: false });
			// set user session
			req.session.user = username;
			// set userid
			req.session.userid = userid;

			// redireact to dashboard
			res.redirect('http://127.0.0.1:3000/oidc/dashboard');
		}
		else {
			res.redirect('/oidc/login');
		}

	}

	// Dashboard service
	@Get('dashboard')
	@Render('dashboard')
	getdDashboard(@Res() res: Response, @Req() req: Request) {
		//console.log('Request session ID: ', req.sessionID);
		return { message: req.cookies["username-idp"] };
	}

	// Receive Auth code + Client ID to verify
	@Post('token')
	async exchangeAuthCode(
		@Body() body: any,
		@Req() req: Request
	) {
		
		const { clientId, authCode, clientSecret, redirectUri } = body;
		// Validate client auth_code
		let user_id = this.oidcService.validateAuthCode(authCode, clientId);
		if (user_id === null) {
			throw new UnauthorizedException('Invalid client credentials');
		}

		// Exchange authorization code for access token and optionally refresh token
		const accessToken = this.oidcService.generateAccessToken(req.cookies['userid-idp'], clientId);
		const idToken = this.oidcService.generateIdToken(req.cookies['userid-idp'], clientId, "http://127.0.0.1:3000/oidc", user_id
		);
		console.log("---------- Generate accessToken: \n", { access_token: accessToken, id_token: idToken });

		return { access_token: accessToken, id_token: idToken };
	}

	@Get('logout')
	@Render('logout')
	getLogoutPage(@Res() res: Response, @Req() req: Request) {
		return { message: req.cookies["username-idp"], method: 'oidc'};
	}

	@Post('logout')
	logOut(@Body('logout') logout: string, @Res() res: Response, @Req() req: Request) {
		// If logout value == yes then delete user info on thiss session
		if (logout == 'yes') {
			res.clearCookie("logined-idp");
			//console.log(req.cookies["logined"]);
			res.clearCookie("username-idp");
		}
		res.redirect('/oidc/dashboard');
	}

}
