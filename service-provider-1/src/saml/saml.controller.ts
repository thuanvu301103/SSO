import { Controller, Get, Req, Res } from '@nestjs/common';

@Controller('saml')
export class SamlController {
	@Get('dashboard')
	getdas() {
		return "hrllo";
	}
	
}
