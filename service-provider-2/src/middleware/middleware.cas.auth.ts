/*---SP2-CAS---*/

import { Injectable, NestMiddleware, Req, Res } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CasAuthMiddleware implements NestMiddleware {
	constructor() {}	

	use(@Req() req: Request, @Res() res: Response, next: NextFunction) {
		// Check whether users have aldready login or not
		
		if (!req.cookies["logined-sp2"] || !req.cookies["username-sp2"]) {
      		// If not, redirect user to login page
			res.redirect('/cas/login');
		}
    	// If user has aldready logined, continue to access services
    	else next();
  	}
}