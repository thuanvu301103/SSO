// IdP

import { Injectable } from '@nestjs/common';
import { login_data } from '../schema/schema.logindata'
import * as xml2js from 'xml2js'; // Import xml2js properly
import * as zlib from 'zlib'; // Import zlib for decompression


@Injectable()
export class SamlService {

	// Authenticate user by username and password
	public authenticate (user_name: string, pass_word: string) {
		console.log("Input: " + user_name + " - " + pass_word);
		let result = false
		for (let i in login_data) {
			if (user_name == login_data[i].username && pass_word == login_data[i].password) {	
				return true;
			}
		}
		return false; 
	}

	// decode SAML requesst message
	public decodeAndParseSamlRequest(encodedRequest: string): Promise<any> {
    		try {
			// Log encoded request
			console.log('\nEncoded SAML request sent from SP: ', encodedRequest);
			
			encodedRequest = encodedRequest.replace(/ /g, '+');
			const decodedRequest = Buffer.from(encodedRequest, 'base64');

			// Decompress the decoded data
    			const decompressedXml = zlib.inflateSync(decodedRequest);

    			// Convert the decompressed data to a string
    			const samlRequest = decompressedXml.toString('utf-8');
			
        		// Log decoded request
        		//console.log('\nDecoded SAML request sent from SP: \n', decodedRequest);
			console.log('\nDecoded SAML request sent from SP: \n', samlRequest);

        		// Parse the XML
        		const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
        		return new Promise((resolve, reject) => {
            			parser.parseString(samlRequest, (err, result) => {
                			if (err) {
                    				console.error('Error parsing SAML request XML:', err);
                    				reject(err); // Reject if parsing fails
                			} else {
                    				// Extract necessary information
                    				const samlRequest = result['samlp:AuthnRequest'];
                    				const requestId = samlRequest['ID'];
                    				const issuer = samlRequest['Issuer'];
                    				//const nameId = samlRequest['saml:Subject']['saml:NameID']['_'];
                    				const assertionConsumerServiceURL = samlRequest['AssertionConsumerServiceURL'];

                    				// Construct JSON object with extracted information
                    				const jsonRequest = {
                        				requestId: requestId,
                        				issuer: issuer,
                        				/*nameId,*/
                        				assertionConsumerServiceURL: assertionConsumerServiceURL
                        				// Add more fields as needed
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

	// encode SAML response message
	public generateSamlResponse(requestId: string, assertionConsumerServiceURL: string, user: string): string {
    		// Construct the SAML response XML
    		const samlResponse = 
			`<samlp:AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:protocol" ID="5678" InResponseTo="${requestId}" Version="2.0" IssueInstant="2024-03-24T12:00:03Z" Destination="${assertionConsumerServiceURL}">
    				<Issuer>http://127.0.0.1:3000</Issuer>
				<samlp:Status>
        				<samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    				</samlp:Status>
				<saml:Assertion ID="assertion5678" Version="2.0" IssueInstant="2024-03-24T12:00:03Z" xmlns="urn:oasis:names:tc:SAML:2.0:assertion">
        				<saml:Issuer>http://127.0.0.1:3000</saml:Issuer>
        				<saml:Subject>
            					<saml:NameID>${user}</saml:NameID>
        				</saml:Subject>
        				<saml:Conditions NotBefore="2024-03-25T08:00:00Z"
                         				NotOnOrAfter="2024-03-25T08:05:00Z"/>
        				<saml:AuthnStatement AuthnInstant="2024-03-25T08:00:00Z">
            					<saml:AuthnContext>
                					<saml:AuthnContextClassRef>
                    						urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
                					</saml:AuthnContextClassRef>
           	 				</saml:AuthnContext>
        				</saml:AuthnStatement>
    				</saml:Assertion>
    				<NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
    				<!-- Any additional elements or attributes required by your IdP -->
			</samlp:AuthnRequest>`;
		
		// Log SAML Response
		console.log("Generate SAML Response: ", samlResponse);
		
		// Compress the XML payload
		const compressedXml = zlib.deflateSync(samlResponse);
	
		// Encode the XML string
    		const encodedResponse = Buffer.from(compressedXml).toString('base64');

		return encodedResponse;
  	}	

}