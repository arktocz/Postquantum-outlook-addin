import CryptoJS from 'crypto-js';

export function AESgenerateIV() {
    let iv = new Uint8Array(16);
    for (let i = 0; i < iv.length; i++) {
        iv[i] = Math.floor(Math.random() * 256); // Náhodné číslo 0-255
    }
    return CryptoJS.lib.WordArray.create(iv);
}

export function AES_Decrypt(cypher_text, key, IV) {
    //wordarray
    // console.log(cypher_text);
    // let ct= CryptoJS.enc.Base64.parse(cypher_text);
    const decrypted = CryptoJS.AES.decrypt(cypher_text, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: IV
    });
    // console.log(decrypted.toString());
    return decrypted.toString(CryptoJS.enc.Utf8);
}

export function AES_Encrypt(open_text, key, IV) {
    const encrypted = CryptoJS.AES.encrypt(open_text, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: IV
    });
    return encrypted.toString();
}
