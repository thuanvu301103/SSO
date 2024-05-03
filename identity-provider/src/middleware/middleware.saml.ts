/*---IdP-SAML---*/

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Req, Res} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SamlService } from '../saml/saml.service'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	
	constructor(
		private readonly samlService: SamlService
	) { }
	
	async use(@Req() req: Request, @Res() res: Response, next: NextFunction) {

		// Check whether user's information is in session or not. If no, redirect to login page
		if (!req.cookies["logined-idp"] || !req.cookies["username-idp"]) {
			// Check session cookie: User has not logined
      		res.redirect('http://127.0.0.1:3000/saml/login');
    	}

		// If user has aldready logined
		let ascServiceURL: string;
		let requestId: string;
		// If the request is from SP then redirect back to SP
		if (req.session.samlreq) {
			// Decode SAML Request
			await this.samlService.decodeAndParseSamlRequest(req.session.samlreq)
				.then((jsonResponse) => {
        			// Handle the jsonResponse containing the extracted data
					ascServiceURL = jsonResponse.assertionConsumerServiceURL;
					requestId = jsonResponse.requestId;
    				})
    				.catch((error) => {
        				// Handle any errors that occurred during decoding and parsing
        				console.error(error);
    				});
			
			let decode_res_result = this.samlService.generateSamlResponse(
				requestId,
				ascServiceURL,
				req.cookies["username-idp"]				 
			);
			// reley from browser to SP
			let redirect_link = ascServiceURL + '?SAMLResponse=' + decode_res_result;
      		res.redirect(redirect_link);
		}
    	else next();
  	}
}
