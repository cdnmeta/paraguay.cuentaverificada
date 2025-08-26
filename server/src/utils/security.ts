import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomFill,
  randomUUID,
  scrypt,
} from 'crypto';
import { hash as bcryptHash, compare } from 'bcrypt';

export function generateToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url'); // seguro y corto en URL
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

export function generarUUIDHASH(limit: number = 12): string {
  const uuid = randomUUID();
  if (!limit || limit <= 0) {
    return createHash('sha1').update(uuid).digest('hex');
  }
  return createHash('sha1').update(uuid).digest('hex').slice(0, limit);
}

export const hash = async (data: string) =>
  bcryptHash(data, parseInt(process.env.HASH_SALT || '10', 10));

export const _encrypt = async (data: string): Promise<string> => {
  const algorithm = 'aes-192-cbc';
  const salt = randomBytes(8).toString('hex');

  return new Promise((resolve, reject) => {
    scrypt(process.env.ENCRYPT_PASSWORD as string, salt, 24, (err, key) => {
      if (err) reject(err);

      randomFill(new Uint8Array(16), (err, iv) => {
        const ivHex = Buffer.from(iv).toString('hex');
        if (err) reject(err);

        const cipher = createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const result = `${salt}|${ivHex}|${encrypted}`;
        resolve(result);
      });
    });
  });
};

export const _decrypt = async (encryptedData: string): Promise<string> => {
  const algorithm = 'aes-192-cbc';

  return new Promise((resolve, reject) => {
    const [salt, ivHex, encrypted] = encryptedData.split('|');

    if (!salt || !ivHex || !encrypted) reject(new Error('Invalid data'));

    const iv = Buffer.from(ivHex, 'hex');

    scrypt(process.env.ENCRYPT_PASSWORD as string, salt, 24, (err, key) => {
      if (err) reject(err);

      const decipher = createDecipheriv(algorithm, key, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      resolve(decrypted);
    });
  });
};

export const encrypt = async (data: string) => {
  const encrypted = await _encrypt(data);
  const hashed = await hash(data);

  return `${hashed}|${encrypted}`;
};

export const decrypt = async (data: string) => {
  const [_, ...rest] = data.split('|');
  const encrypted = rest.join('|');

  return await _decrypt(encrypted);
};

export const verify = async (data: string, encryptedData: string) => {
  const [bcryptHash, ...rest] = encryptedData.split('|');
  const encrypted = rest.join('|');

  const isValid = await compare(data, bcryptHash);
  if (!isValid) return false;

  const decrypted = await _decrypt(encrypted);
  return decrypted === data;
};
