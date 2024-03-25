// SP

import { Controller, Get, Req, Res, Render, Query } from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { SamlService } from './saml.service';
import * as session from 'express-session';

@Controller('saml')
export class SamlController {

	constructor(
		private readonly samlService: SamlService
	) { }	

	@Get('asc')
	async getAsc(
		@Res() res: Response,
		@Req() req: Request,
		@Query ('SAMLResponse') saml_response: string 
	) {
		if (saml_response) {
			let username = null;
			await this.samlService.decodeAndParseSamlResponse(saml_response)
				.then((jsonResponse) => {
        				// Handle the jsonResponse containing the extracted data
					username = jsonResponse['username'];
        				console.log(jsonResponse);
    				})
    				.catch((error) => {
        				// Handle any errors that occurred during decoding and parsing
        				console.error(error);
    				});
			//console.log('Decode SAML req from SP got: ', decode_res_result.resolve['username']);
			// Save username
			req.session.user = username;
			
			res.redirect('dashboard');
			
		} else {
			return null;
		}
	}
	
	@Get('dashboard')
	@Render('dashboard')
	getDas() {
		return null;
	} 
	
}
