/*---IdP---*/

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Controller, Get, Post, Body, Redirect, Render, Req, Res, Query} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SamlService } from '../saml/saml.service'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	
	constructor(
		private readonly samlService: SamlService
	) { }
	
	async use(@Req() req: Request, @Res() res: Response, next: NextFunction) {

		// Check whether user's information is in session or not. If no, redirect to login page
		console.log("---------- User requires SP-1's services ----------\n");
		console.log("---------- Check if user has logined to IdP in this session or not ----------\n");
		//console.log("Login: ", req.cookies["logined"], ",", req.cookies["logined"] === false, ",", !req.cookies["logined"] || req.cookies["logined"] === false);
		if (!req.cookies["logined-idp"] || !req.cookies["username-idp"]) {
			console.log("Check session cookie: User has not logined\n");
			console.log("Redirect user to login page\n");
      		res.redirect('http://127.0.0.1:3000/saml/login');
    	}

    		// If user has aldready logined
		console.log("Check session cookie: User has already logined\n");
		let ascServiceURL: string;
		let requestId: string;
		// If the request is from SP then redirect back to SP
		if (req.session.samlreq) {
			console.log("----------Decode SAML Request----------\n");
			await this.samlService.decodeAndParseSamlRequest(req.session.samlreq)
				.then((jsonResponse) => {
        				// Handle the jsonResponse containing the extracted data
					ascServiceURL = jsonResponse.assertionConsumerServiceURL;
					//console.log('Asc 1: ', ascServiceURL);
					requestId = jsonResponse.requestId;
        			//console.log('Json Response: ', jsonResponse.assertionConsumerServiceURL);
    				})
    				.catch((error) => {
        				// Handle any errors that occurred during decoding and parsing
        				console.error(error);
    				});
			//console.log('Decode SAML req from SP got: ' + decode_req_result.toString());
			
			let decode_res_result = this.samlService.generateSamlResponse(
				requestId,
				ascServiceURL,
				req.cookies["username-idp"]				 
			);
			// reley from browser to SP
			//console.log('Asc: ', ascServiceURL);
			let redirect_link = ascServiceURL + '?SAMLResponse=' + decode_res_result;
			console.log("----------Redirect to IdP with SAML Login Request----------\n" + redirect_link, "\n");
      		res.redirect(redirect_link);
		}
    		next();
  	}
}
