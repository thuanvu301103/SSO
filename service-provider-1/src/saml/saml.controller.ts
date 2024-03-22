import { Controller, Get, Req, Res } from '@nestjs/common';
import * as xmlbuilder from 'xmlbuilder';
import * as zlib from 'zlib';
import * as querystring from 'querystring';
import * as crypto from 'crypto';

@Controller('saml')
export class SamlController {

	@Get('login')
  	async login(@Req() req, @Res() res) {

        // Identity Provider SSO URL
        const idpSsoUrl = 'http://127.0.0.1:3000/saml/login';
        // Assertion Consumer Service URL - where IdP sends the SAML assertion after successful authentication
        const serviceProviderUrl = 'http://127.0.0.1:3001/saml/assertion-consumer';
        // Service Provider Entity ID -  helps the IdP identify the SP that the user is trying to authenticate with
    	const serviceProviderEntityId = 'http://127.0.0.1:3001'; 

    	// Generate SAML AuthnRequest
    	const samlRequest = this.generateSamlRequest(serviceProviderUrl, serviceProviderEntityId);

    	// Redirect the user to the Identity Provider with the SAML request
    	const redirectUrl = `${idpSsoUrl}? ${querystring.stringify({ SAMLRequest: samlRequest })}`;
    	res.redirect(redirectUrl);
    }

    @Get('acs')
    async acs(@Req() req, @Res() res) {
        const samlResponse = req.query.SAMLResponse;

        // Decode base64-encoded SAMLResponse
        const decodedResponse = Buffer.from(samlResponse, 'base64').toString('utf-8');

        // Parse the SAMLResponse XML
        const parsedResponse = await this.parseSamlResponse(decodedResponse);

        // Extract user attributes from the SAMLResponse
        const userId = parsedResponse.userId;
        const username = parsedResponse.username;
        // Extract other attributes as needed...

        // Create a session for the user and redirect to the desired location
        // Example: res.redirect('/dashboard');
    }


    // Function to generate SAML AuthnRequest
    generateSamlRequest(serviceProviderUrl: string, serviceProviderEntityId: string): string {
        const requestId = crypto.randomBytes(16).toString('hex');
        const issueInstant = new Date().toISOString();

        // Construct the SAML AuthnRequest XML
        const authnRequestXml = `
        <samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" 
            ID="${requestId}" 
            Version="2.0" 
            IssueInstant="${issueInstant}" 
            Destination="https://127.0.0.1:3000/saml" 
            AssertionConsumerServiceURL="${serviceProviderUrl}" 
            ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" 
            AssertionConsumerServiceIndex="0" 
            AttributeConsumingServiceIndex="0">
            <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${serviceProviderEntityId}</saml:Issuer>
        </samlp:AuthnRequest>`;

        // Log the XML request to the console
        console.log('SAML AuthnRequest XML:', authnRequestXml);

        // Deflate and encode the XML
        return zlib.deflateSync(authnRequestXml, { level: zlib.constants.Z_BEST_COMPRESSION }).toString('base64');
    }


    // Function to parse SAMLResponse
    async parseSamlResponse(samlResponse: string): Promise<any> {
        // Parse the SAMLResponse XML here
        // Extract user attributes and return them
        // Example:
        // const userId = parsedResponse.userId;
        // const username = parsedResponse.username;
        return Promise.resolve({ userId: '123', username: 'user@example.com' });
    }

    private xmlToString(xmlObject) {
        // Create XML builder instance
        const builder = xmlbuilder.create(xmlObject.name, { version: '1.0', encoding: 'UTF-8' });

        // Add attributes to the XML element
        for (const [key, value] of Object.entries(xmlObject.attribs)) {
            builder.attribute(key, String(value)); // Cast value to string
        }

        // Add child elements recursively
        function addChildren(parent, children) {
            children.forEach(child => {
                const element = parent.ele(child.name);
                if (child.children && child.children.length > 0) {
                    addChildren(element, child.children);
                }
            });
        }
        addChildren(builder, xmlObject.children);

        // Return XML string
        return builder.end({ pretty: true });
    }

}
