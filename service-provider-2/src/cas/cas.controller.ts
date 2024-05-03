/*---SP2-CAS---*/

import { Controller, Get, Post, Body, Req, Res, Render, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { CasService } from './cas.service';
import axios from 'axios';

@Controller('cas')
export class CasController {
	private IdP_cas_loginpage = 'http://127.0.0.1:3000/cas/login';
	private SP_cas_service = 'http://127.0.0.1:3002/cas';
	private IdP_cas_serviceValidate = 'http://127.0.0.1:3000/cas/serviceValidate?';

	constructor(private readonly casService: CasService) { }

	@Get()
	async authenticate(
		@Res() res: Response,
		@Req() req: Request,
		@Query('ticket') ticket: string
	) {
		console.log("---------- Receive Service Ticket: ", ticket);
		res.cookie('ST', ticket, { httpOnly: false });
		req.session.ST = ticket;
		try {
			const response = await axios.get(this.IdP_cas_serviceValidate + 'service=' + this.SP_cas_service + '&ticket=' + ticket);
			console.log("---------- Receive XML Response from IdP: ", response.data);
			const parsedResult = await this.casService.parse(response.data);
			const isSuccessed = parsedResult['cas:serviceResponse']['cas:authenticationSuccess'] ? true : false;
			if (isSuccessed === true) {
				res.cookie('logined-sp2', true, { httpOnly: false });
				res.cookie('username-sp2', parsedResult['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'], { httpOnly: false });
				res.redirect('/cas/dashboard');
			}
			else res.redirect('/cas/login');
		} catch (error) {
			// Handle error appropriately
			throw error;
		}

	}

	@Get('login')
	@Render('login')
	getLoginPage() {
		const redirect_link = this.IdP_cas_loginpage + '?service=' + this.SP_cas_service;
		return { method: "CAS", message: redirect_link };
	}

	@Get('dashboard')
	@Render('dashboard')
	getDas(@Req() req: Request) {
		return { message: req.cookies["username-sp2"] };
	}

	@Get('logout')
	@Render('logout')
	getLogoutPage(@Res() res: Response, @Req() req: Request) {
		return { message: req.cookies["username-sp2"], method: 'cas'};
	}

	@Post('logout')
	logOut(@Body('logout') logout: string, @Res() res: Response, @Req() req: Request) {
		// If logout value == yes then delete user info on thiss session
		if (logout == 'yes') {
			res.clearCookie("logined-sp2");
			//console.log(req.cookies["logined"]);
			res.clearCookie("username-sp2");
		}
		res.redirect('/cas/dashboard');
	}

}
