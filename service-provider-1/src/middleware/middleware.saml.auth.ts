// SP

import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SamlService } from '../saml/saml.service';
import * as session from 'express-session';

@Injectable()
export class SamlAuthMiddleware implements NestMiddleware {
	constructor(private readonly samlService: SamlService) {}	
	
	private IdP_saml_loginpage = 'http://127.0.0.1:3000/saml/login';

	use(@Req() req: Request, @Res() res: Response, next: NextFunction) {
		// Check whether user's information is in session or not
		console.log("/nOn accessing to SP service: Session-username = ", req.session.user);
	
		if (!req.session || !req.session.user) {
      		// If not, redirect user to login page
			let redirect_link = this.IdP_saml_loginpage + '?SAMLRequest=' + this.samlService.generateSamlRequest();
			console.log("/nRedirect to IdP link: " + redirect_link);   
      			res.redirect(redirect_link);
    		}
    		// If user has aldready logined, continue to access services	
    		next();
  	}
}