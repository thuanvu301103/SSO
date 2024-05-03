/*---SP1-OIDC---*/

import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { OidcService } from '../oidc/oidc.service';

@Injectable()
export class OidcAuthMiddleware implements NestMiddleware {
	constructor(private readonly oidcService: OidcService) {}	
	
	use(@Req() req: Request, @Res() res: Response, next: NextFunction) {
		// Check whether users have aldready login or not

		if (!req.cookies["logined-sp1"] || !req.cookies["username-sp1"]) {
      		// If not, redirect user to login page
			
			res.redirect('/oidc/login');
		}
    	
    	else next();
  	}
}