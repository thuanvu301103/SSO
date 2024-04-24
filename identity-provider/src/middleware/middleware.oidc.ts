/*---IdP-OIDC---*/

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Controller, Get, Post, Body, Redirect, Render, Req, Res, Query} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { OidcService } from '../oidc/oidc.service'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	
	constructor(
		private readonly oidcService: OidcService
	) { }
	
	async use(@Req() req: Request, @Res() res: Response, next: NextFunction) {

		// Check whether user's information is in session or not. If no, redirect to login page
		if (!req.cookies["logined-idp"] || !req.cookies["username-idp"]) {
      		res.redirect('http://127.0.0.1:3000/oidc/login');
		}
		//console.log(req.session.queries);

		// If user has aldready logined
		// If the request is from SP then redirect back to SP
		if (Object.keys(req.session.queries).length > 0) {
			console.log("---------- Generate authorization code: ");
			const authcode = await this.oidcService.genAuthCode(req.session.userid, req.session.queries.client_id);
			console.log(authcode);
			
			let redirect_link = req.session.queries.redirect_uri + '?code=' + authcode + '&state=random_state_value';
      		res.redirect(redirect_link);
		}
		next();
  	}
}
