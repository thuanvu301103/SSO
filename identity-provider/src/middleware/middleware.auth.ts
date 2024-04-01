import { Injectable, NestMiddleware } from '@nestjs/common';
import { Controller, Get, Post, Body, Redirect, Render, Req, Res, Query} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as path from 'path'; // Import path module to work with file paths
import { SamlService } from '../saml/saml.service'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	
	constructor(
		private readonly samlService: SamlService
	) { }
	
	async use(@Req() req: Request, @Res() res: Response, next: NextFunction) {

		// Check whether user's information is in session or not. If no, redirect to login page
		console.log("\nOn accessing to IdP: Session-user: " + req.session.user);
	
		if (!req.session || !req.session.user) {
			console.log("\nRedirect user to login page.");
      			res.redirect('/saml/login');
    		}

    		// If user has aldready logined
		let ascServiceURL: string;
		let requestId: string;
		// If the request is from SP then redirect back to SP
		if (req.session.samlreq) {
			await this.samlService.decodeAndParseSamlRequest(req.session.samlreq)
				.then((jsonResponse) => {
        				// Handle the jsonResponse containing the extracted data
					ascServiceURL = jsonResponse.assertionConsumerServiceURL;
					console.log('Asc 1: ', ascServiceURL);
					requestId = jsonResponse.requestId;
        				console.log('Json Response: ', jsonResponse.assertionConsumerServiceURL);
    				})
    				.catch((error) => {
        				// Handle any errors that occurred during decoding and parsing
        				console.error(error);
    				});
			//console.log('Decode SAML req from SP got: ' + decode_req_result.toString());
			let decode_res_result = this.samlService.generateSamlResponse(
				requestId,
				ascServiceURL,
				req.session.user				 
			);
			// reley from browser to SP
			console.log('Asc: ', ascServiceURL);
			let redirect_link = ascServiceURL + '?SAMLResponse=' + decode_res_result;
			console.log("Redirect link: " + redirect_link);   
      			res.redirect(redirect_link);
		}
    		next();
  	}
}
