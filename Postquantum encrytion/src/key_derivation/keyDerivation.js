export async function deriveKey(passphrase, saltHex) {
    const encoder = new TextEncoder();
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    const keyBuffer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );

    return bufferToHex(keyBuffer);
}

// Convert ArrayBuffer to Hex String (since Buffer doesn't exist in browsers)
function bufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

// Example usage with a fixed salt (must be the same for consistent results)
// const passphrase = "my_secure_passphrase";
// const salt = "1234567890abcdef1234567890abcdef"; // 16-byte fixed salt in hex

// deriveKey(passphrase, salt).then(derivedKey => {
//     console.log("Derived Key:", derivedKey);
// });