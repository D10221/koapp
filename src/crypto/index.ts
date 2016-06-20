import * as path from 'path';
import * as crypto from 'crypto';

const config = require(
      process.env.configPath ||
      path.join(process.cwd(), 'app.config')
    );

const algorithm = 'aes-256-ctr';


export function encrypt(text:string) : string {
  var cipher = crypto.createCipher(algorithm,config.secret);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}
 
export function decrypt(text:string) : string {
  var decipher = crypto.createDecipher(algorithm,config.secret);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}


export function tryeDecrypt(text:string) : { value:string , error:Error } {
  try {    
    return { value: decrypt(text) , error: null };
  } catch (e) {
    return { value: null, error:e}; 
  }
}

export function tryEncrypt(text:string): { value:string , error:Error } {
   try {    
    return { value: encrypt(text) , error: null };
  } catch (e) {
    return { value: null, error:e}; 
  } 
}