/*---IdP-CAS---*/

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Req, Res} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CasService } from '../cas/cas.service'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	
	constructor(
		private readonly casService: CasService
	) { }

	async use(@Req() req: Request, @Res() res: Response, next: NextFunction) {
		
		// Check whether user's information is in session or not. If no, redirect to login page
		
		if (!req.cookies["logined-idp"] || !req.cookies["username-idp"]) {
			// Check session cookie: User has not logined
      		res.redirect('http://127.0.0.1:3000/cas/login');
    	}

		// If user has aldready logined
		// If the request is from SP then redirect back to SP

		if (req.session.org_service) {
			// Generate TGT
			const TGT = this.casService.genTGT(req.cookies["username-idp"]);
			// Generate ST
			const ST = this.casService.genST(req.cookies["username-idp"]);

			console.log("---------- Gnenerate TGT and ST ---------- \n TGT: ", TGT, "\n ST: ", ST);

			let redirect_link = req.session.org_service + '?ticket=' + ST;
      		res.redirect(redirect_link);
		}
		
    	else next();
  	}
}
