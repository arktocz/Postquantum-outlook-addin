import { MlKem768 } from "mlkem"; 

function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
}

function hexToUint8Array(hexString) {
  if (hexString.length % 2 !== 0) {
      throw new Error("Invalid hex string length");
  }
  const uint8Array = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
      uint8Array[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return uint8Array;
}

/**
 * Generates a Kyber key pair (public and secret keys).
 *
 * @returns {Promise<[string, string]>} A promise that resolves to an array containing:
 *    - The public key as a hexadecimal string.
 *    - The secret key as a hexadecimal string.
 */
export async function kyberGenKeys() {
  const recipient = new MlKem768(); // MlKem512 and MlKem1024 are also available.
  const [public_key, secret_key] = await recipient.generateKeyPair();
  return [uint8ArrayToHex(public_key), uint8ArrayToHex(secret_key)];
}

/**
 * Generates a Kyber ciphertext and shared secret key (SSK) using the recipient's public key.
 *
 * @param {string} kyberhex_recipient_pk - The recipient's Kyber public key in hexadecimal format.
 * @returns {Promise<[string, string]>} A promise that resolves to an array containing:
 *    - The ciphertext as a hexadecimal string.
 *    - The shared secret key (SSK) as a hexadecimal string.
 */
export async function kyberGenCiphertext_SSK(kyberhex_recipient_pk) {
  const kyber_recipient_pk = hexToUint8Array(kyberhex_recipient_pk);
  const sender = new MlKem768();
  const [ciphertext, shared_secret_key] = await sender.encap(kyber_recipient_pk);
  return [uint8ArrayToHex(ciphertext), uint8ArrayToHex(shared_secret_key)];  
}

/**
 * Deciphers a Kyber ciphertext to retrieve the shared secret key (SSK).
 *
 * @param {string} ciphertext_hex - The Kyber ciphertext in hexadecimal format.
 * @param {string} kyberhex_recipient_sk - The recipient's Kyber secret key in hexadecimal format.
 * @returns {Promise<string>} A promise that resolves to the shared secret key as a hexadecimal string.
 */
export async function kyberDecipherCiphertext(ciphertext_hex, kyberhex_recipient_sk) {
  const recipient = new MlKem768();
  const shared_secret_key = await recipient.decap(hexToUint8Array(ciphertext_hex), hexToUint8Array(kyberhex_recipient_sk));
  return uint8ArrayToHex(shared_secret_key);
}
