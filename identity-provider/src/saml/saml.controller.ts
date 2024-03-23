import { Controller, Get, Redirect, Render, Req, Res} from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import * as session from 'express-session';
import { AuthMiddleware } from '../middleware/middleware.auth';

@Controller('saml')
export class SamlController {   	

    	@Get('login')
	@Render('login')
	grtLoginPage (res: Response) {
		return {message: "SAML"};
	}
}
