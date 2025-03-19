# Outlook postquantum encryption addin

## Description:
This project is proof-of-concept for implementation of postquantum encryption into MS Outlook via addin. Estabilishment of shared secret key is based on mlkem758 algorithm, while further communication is encrypted by AES256 in CBC mode. Main purpose of this concept is to create technology that implements postquantum encryption without need for support of postquantum encryption directly from email environment (so via unsecured channel) nor anybody else (outside of the other side of the communication).

## Installation:
- developed with:
- node.js v22.13.1
- npm 10.9.2
- manifest installation

## Usage:
- project is run via webkit, so by npm start|stop commands
- addin UI follow basic hybrid key estabilishment scheme:
    1. Gen. Keys - generates public and secret mlkem keys and downloads them
    2. Gen. Ciphertext - user needs to open empty email to compose and upload reciever public key, this function then generates ciphertext and puts it into email body
    3. Decipher Ciphertext - user needs to open recieved email with ciphertext and upload his secret key, this function then decrypts ciphertext and downloads shared secret key for further communication
    4. AES Cipher - user needs to compose email and write wanted message, then upload shared secret key, this function then encrypts the message and replaces the open text with that encrypted message (+IV)
    5. AES decipher - user needs to open recieved encrypted email and upload shared secret key, this function decripts that email and show the open text in new window

## License:
- MIT License

## Credits:
- this project relies on work of:
    1. github.com/dajiaji/crystals-kyber-js
    2. github.com/brix/crypto-js
    3. github.com/OfficeDev/generator-office


