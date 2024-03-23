import { Controller, Get, Redirect, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import * as session from 'express-session';

@Controller('saml')
export class SamlController {

    	// This route should be accessible to users trying to log in via SAML
    	@Get('login')
    	async getloginpage () {
		return "Hello";
	}
}
