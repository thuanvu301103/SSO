/*---IdP-CAS---*/

import { Injectable } from '@nestjs/common';
import { login_data } from '../schema/schema.logindata';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CasService {

	private TGTStore: Record<string, any> = {};

	// Authenticate user by username and password
	public authenticate(user_name: string, pass_word: string) {
		console.log("---------- Input username - password: " + user_name + " - " + pass_word, "\n");
		let result = false;
		for (let i in login_data) {
			if (user_name == login_data[i].username && pass_word == login_data[i].password) {
				return true;
			}
		}
		return false;
	}

	public genTGT(username) {
		const tgt = uuidv4(); // Generate a random TGT
		//const expiresAt = new Date();
		//expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Set expiration time (e.g., 30 minutes)
		const key = `${username}`
		this.TGTStore[key] = { TGT: tgt, ST: null }; // Store TGT with associated user information and expiration time
		return tgt;
	}

	public genST(username) {
		const st = uuidv4(); // Generate a random TGT
		//const expiresAt = new Date();
		//expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Set expiration time (e.g., 30 minutes)
		const key = `${username}`
		this.TGTStore[key]["ST"] = st; // Store TGT with associated user information and expiration time
		return st;
	}

	public validateService(ST: string): any {
		for (let key in this.TGTStore) {
			if (this.TGTStore[key]['ST'] === ST) {
				console.log(" Result: successed");
				return key; // Return username
			}
		}
		/*...Other validation...*/
		console.log(" Result: failed");
		return null;
	}

	public genXMLRes(username: string, serviceTicket: string): any {
		if (username) {
			return `
				<cas:serviceResponse xmlns:cas="http://127.0.0.1:3000/cas">
					<cas:authenticationSuccess>
						<cas:user>${username}</cas:user>
					</cas:authenticationSuccess>
				</cas:serviceResponse>
			`;
		} else {
			return `
				<cas:serviceResponse xmlns:cas="http://127.0.0.1:3000/cas">
					<cas:authenticationFailure code="INVALID_TICKET">
						Ticket ${serviceTicket} not recognized
					</cas:authenticationFailure>
				</cas:serviceResponse>
			`;
		}
	}

}
