import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		// Check whether user's information is in session orr not
		if (!req.session || !req.session.user) {
      			// If not, redirect user to login page
      			return res.redirect('http:127.0.0.1:3000/saml/login');
    		}
    		// If user has aldready logined, continue	
    		next();
  	}
}
