/*---SP-1---*/

import { Injectable } from '@nestjs/common';
import * as zlib from 'zlib'; // Import zlib for compression
import * as xml2js from 'xml2js'; // Import xml2js properly
import { user_data } from '../schema/schema.userdata';	// Import user-data form schema


@Injectable()
export class SamlService {

	// Generate SAML Request to send to IdP - compress XML to bind to URL later
	public generateSamlRequest(): string {
    		// Construct the SAML authentication request XML
    	const samlRequest = 
			`<samlp:AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:protocol" ID="1234" Version="2.0" IssueInstant="2024-03-24T12:00:00Z" Destination="http://127.0.0.1:3000/saml/login"	AssertionConsumerServiceURL = "http://127.0.0.1:3001/saml/asc" ProtocolBinding = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
    			<Issuer>http://127.0.0.1:3001</Issuer>
    			<NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
    			<!-- Any additional elements or attributes required by your IdP -->
			</samlp:AuthnRequest>`;
		
		// Log XML request message	
		console.log("---------- Generate SAMLAuthnRequest: \n", samlRequest, "\n");
	
		// Compress the XML payload
        //const compressedXml = zlib.deflateSync(encodedRequest);
		const compressedXml = zlib.deflateSync(samlRequest);
	
		// Encode the XML string
    	const encodedRequest = Buffer.from(compressedXml).toString('base64');

		return encodedRequest;
  	}

	// decode SAML response message
	public decodeAndParseSamlResponse (encodedResponse: string): Promise<any> {
    		try {
			// Log encoded request
			
			encodedResponse = encodedResponse.replace(/ /g, '+');

			const decodedResponse = Buffer.from(encodedResponse, 'base64');


			// Decompress the decoded data
    			const decompressedXml = zlib.inflateSync(decodedResponse);

    			// Convert the decompressed data to a string
    			const samlResponse = decompressedXml.toString('utf-8');
			
        		// Log decoded request
        		//console.log('Decoded SAML request:', decodedRequest);
				
				console.log('---------- Decoded SAMLResponse sent from IdP: \n', samlResponse);
        		// Parse the XML
        		const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
        		return new Promise((resolve, reject) => {
            			parser.parseString(samlResponse, (err, result) => {
                			if (err) {
                    				console.error('Error parsing SAML request XML:', err);
                    				reject(err); // Reject if parsing fails
                			} else {
                    				// Extract necessary information
                    				const samlRequest = result['samlp:AuthnRequest'];
									const samlAssertion = samlRequest['saml:Assertion'];
									const subject = samlAssertion['saml:Subject'];
									const nameId = subject['saml:NameID'];		// Username
                    				//const requestId = samlRequest['ID'];
                    				//const issuer = samlRequest['Issuer'];
                    				//const nameId = samlRequest['saml:Subject']['saml:NameID']['_'];
                    				//const assertionConsumerServiceURL = samlRequest['AssertionConsumerServiceURL'];
						
                    				// Construct JSON object with extracted information
                    				const jsonRequest = {
										username: nameId,
										origin: "null"  
                   					};

                    				// Resolve with the JSON object
                    				resolve(jsonRequest);
                			}
            			});
        		});
    		} catch (error) {
        		console.error('Error decoding SAML request:', error);
        		return Promise.reject(error);
    		}
	}

	// First protected service: get role-list
	public getRoleList() {
		let result = [];
		for (let i in user_data) {
			result.push({user: user_data[i].username, role: user_data[i].role});
		} 
		return result;
	}

	// Second protected service: get class-list
	public getClassList() {
		let result = [];
		for (let i in user_data) {
			result.push({user: user_data[i].username, class: user_data[i].class});
		} 
		return result;
	}

}
