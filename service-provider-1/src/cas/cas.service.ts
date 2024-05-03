import { Injectable } from '@nestjs/common';
import { parseString } from 'xml2js';

@Injectable()
export class CasService {

    async parse(xmlString: string): Promise<any> {
        return new Promise((resolve, reject) => {
            parseString(xmlString, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

}
