import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_PASSWORD || 'default-password';

export function encryptKey(key: string): string {
  try {
    return CryptoJS.AES.encrypt(key, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt private key');
  }
}

export function decryptKey(encryptedKey: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt private key');
  }
}

export function validatePrivateKey(key: string): boolean {
  // Basic validation for Solana private key
  if (key.includes(' ')) {
    // Seed phrase - should have 12-24 words
    const words = key.trim().split(/\s+/);
    return words.length >= 12 && words.length <= 24;
  } else {
    // Private key - should be base58 encoded
    return key.length >= 30 && key.length <= 200;
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[^a-zA-Z0-9\s]/g, '');
}
