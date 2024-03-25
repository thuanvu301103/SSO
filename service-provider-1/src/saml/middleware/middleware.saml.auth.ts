// SP

import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SamlService } from '../saml.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly samlService: SamlService) {}	

	use(@Req() req: Request, @Res() res: Response, next: NextFunction) {
		// Check whether user's information is in session orr not
		console.log(req.session.user);
		if (!req.session || !req.session.user) {
      		// If not, redirect user to login page
			let redirect_link = 'http://127.0.0.1:3000/saml/login' + '?SAMLRequest=' + this.samlService.generateSamlRequest();
			console.log("Redirect link: " + redirect_link);   
      			res.redirect(redirect_link);
    		}
    		// If user has aldready logined, continue	
    		next();
  	}
}
