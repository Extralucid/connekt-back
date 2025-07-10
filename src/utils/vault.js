import nodeRSA from 'node-rsa';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const keySize = 2048;
const keyOptions = {
  b: keySize,
  e: 65537
};

export const createKeys = () => {
  const key = new nodeRSA(keyOptions);
  const keyPair = key.generateKeyPair();

  const publicKey = keyPair.exportKey('public');
  const privateKey = keyPair.exportKey('private');

  publicKey.replace(/\\n/g, '\n').trim();
  privateKey.replace(/\\n/g, '\n').trim();

  return { publicKey, privateKey };
};

export const encryptData = async ({ data2encrypt, pubKey }) => {
  const key = new nodeRSA(pubKey);

  const token = jwt.sign({ ...data2encrypt }, env.jwt_key);
  const encryptedString = key.encrypt(token, 'base64');

  return encryptedString;
};

export const decryptData = async ({ data2decrypt, privKey }) => {
  const key = new nodeRSA(privKey);

  const decryptedString = key.decrypt(data2decrypt, 'utf8');

  const decoded = jwt.verify(decryptedString, env.jwt_key);

  return { decoded };
};
