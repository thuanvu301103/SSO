/*---SP-1---*/

import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SamlService } from '../saml/saml.service';

@Injectable()
export class SamlAuthMiddleware implements NestMiddleware {
	constructor(private readonly samlService: SamlService) {}	
	
	//private IdP_saml_loginpage = 'http://127.0.0.1:3000/saml/login';

	use(@Req() req: Request, @Res() res: Response, next: NextFunction) {
		// Check whether users have aldready login or not
		console.log("---------- User requires SP-1's services ----------\n");
		console.log("---------- Check if user has logined to SP-1 in this session or not ----------\n");
		if (!req.cookies["logined-sp1"] || !req.cookies["username-sp1"]) {
      		// If not, redirect user to login page
			console.log("Check session cookie: User has not logined. Redirect to SP-1 login page\n");
			//let redirect_link = this.IdP_saml_loginpage + '?SAMLRequest=' + this.samlService.generateSamlRequest();
			//console.log("----------Redirect to IdP with SAML Login Request----------\n" + redirect_link, "\n");   
      		//res.redirect(redirect_link);
			res.redirect('/saml/login');
		}
    		// If user has aldready logined, continue to access services
		//console.log("Check session cookie: User has already logined\n");
    	next();
  	}
}