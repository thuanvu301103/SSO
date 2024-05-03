/*---IdP-OIDC---*/

import { Injectable } from '@nestjs/common';
import { login_data } from '../schema/schema.logindata';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class OidcService {

	constructor(private readonly jwtService: JwtService) { }
	private authorizationCodes: Record<string, any> = {}; // Map to store authorization codes

	// Authenticate user by username and password
	public authenticate(user_name: string, pass_word: string) {
		console.log("---------- Input username - password: " + user_name + " - " + pass_word, "\n");
		let result = false;
		for (let i in login_data) {
			if (user_name == login_data[i].username && pass_word == login_data[i].password) {
				return login_data[i].username;
			}
		}
		return null;
	}

	// Generate authorization code
	public genAuthCode(userId: string, clientId: string) {
		const authorizationCode = uuidv4(); // Generate a random UUID as the authorization code
		const key = `${userId}:${clientId}`;
		//console.log("Key: ", key);
		this.authorizationCodes[key] = { auth_code: authorizationCode, user_id: userId}; // Store the authorization code in memory
		return authorizationCode;
	}

	public validateAuthCode(authCode: string, clientId: string){
		for (const value of Object.values(this.authorizationCodes)) {
			// Check if the current value contains the substring
			if (value['auth_code'] === authCode) {
				console.log("---------- Validate authorization code: successed");
				return value['user_id']; // Return the value if substring is found
			}
		}
		/*...Other validation...*/
		console.log("---------- Validate authorization code: failed");
		return null;
	}

	public generateAccessToken(userId: string, clientId: string): string {
		const payload = {
			sub: userId,
			aud: clientId,
			scope: 'access_token', // Define scopes as needed
		};

		return this.jwtService.sign(payload);
	}

	public generateIdToken(userId: string, clientId: string, issuer: string, user_id: string): string {
		const payload = {
			sub: userId,
			aud: clientId,
			iss: issuer,
			exp: Math.floor(Date.now() / 1000) + 3600, // Expiration time (1 hour from now)
			iat: Math.floor(Date.now() / 1000), // Issued at time
			username: user_id 
			// Add additional claims as needed (e.g., name, email)
		};
		console.log("---------- Generate ID Token: \n", payload);
		return this.jwtService.sign(payload);
	}
}
