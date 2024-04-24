/*---IdP-OIDC---*/

import { Injectable } from '@nestjs/common';
import { login_data } from '../schema/schema.logindata';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OidcService {

	private authorizationCodes: Record<string, string> = {}; // Map to store authorization codes

	// Authenticate user by username and password
	public authenticate(user_name: string, pass_word: string) {
		console.log("---------- Input username - password: " + user_name + " - " + pass_word, "\n");
		let result = false;
		for (let i in login_data) {
			if (user_name == login_data[i].username && pass_word == login_data[i].password) {
				return login_data[i].userid;
			}
		}
		return null;
	}

	// Generate authorization code
	public genAuthCode(userId: string, clientId: string) {
		const authorizationCode = uuidv4(); // Generate a random UUID as the authorization code
		const key = `${userId}:${clientId}`;
		this.authorizationCodes[key] = authorizationCode; // Store the authorization code in memory
		return authorizationCode;
	}

	public findAuthorizationCode(userId: string, clientId: string): string | undefined {
		const key = `${userId}:${clientId}`;
		return this.authorizationCodes[key]; // Retrieve authorization code by userId and clientId
	}


}
