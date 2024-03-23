import { Controller, Get, Req, Res } from '@nestjs/common';
//import * as xmlbuilder from 'xmlbuilder';
//import * as zlib from 'zlib';
//import * as querystring from 'querystring';
//import * as crypto from 'crypto';

@Controller('saml')
export class SamlController {
	
	@Get('set-session')
  	setSession(@Req() req: Request, @Res() res: Response) {
    		//req.session.user = { id: 1, username: 'example_user' };
    		//res.send('Session set successfully');
  	}

  	@Get('get-session')
  	getSession(@Req() req: Request) {
    		//const user = req.session.user;
    		//return user ? user : 'No session found';
		return null;
  	}
}
