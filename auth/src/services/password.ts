import {scrypt, randomBytes} from 'crypto';
import {promisify} from 'util';
const hashSize = 64
const scryptAsync = promisify(scrypt);
export class Password{
    static async toHash(password:string){
        const salt = randomBytes(8).toString('hex');
        const buf = await scryptAsync(password,salt,hashSize)as Buffer;
        return `${buf.toString('hex')}.${salt}`;

    }
    static async compare(hash:string,password:string){
        const [hashedPassword,salt] = hash.split('.');
        return hashedPassword === ((await scryptAsync(password,salt,hashSize)) as Buffer).toString('hex');
    }
}