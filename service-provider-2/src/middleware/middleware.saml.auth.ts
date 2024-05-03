/*---SP-2---*/

import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SamlService } from '../saml/saml.service';

@Injectable()
export class SamlAuthMiddleware implements NestMiddleware {
	constructor(private readonly samlService: SamlService) {}	
	
	//private IdP_saml_loginpage = 'http://127.0.0.1:3000/saml/login';

	use(@Req() req: Request, @Res() res: Response, next: NextFunction) {
		// Check whether users have aldready login or not
		if (!req.cookies["logined-sp2"] || !req.cookies["username-sp2"]) {
      		// If not, redirect user to login page
			res.redirect('/saml/login');
		}
		// If user has aldready logined, continue to access services
    	else next();
  	}
}