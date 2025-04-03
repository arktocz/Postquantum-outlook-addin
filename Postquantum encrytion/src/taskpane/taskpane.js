/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */
// const {greet} = require('./task1.js');
const {AESgenerateIV, AES_Encrypt, AES_Decrypt} = require('../AES/AES.js');
const {kyberGenKeys, kyberGenCiphertext_SSK, kyberDecipherCiphertext} = require('../mlkem/kyber768.js');


Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("GenKyberKeys").onclick = genKyberKeys_outlook;
    document.getElementById("GenCiphertextkey").onclick = genKyberCiphertext_outlook;
    document.getElementById("DeCiphertextkey").onclick = decipherKyberCiphertext_outlook;
    document.getElementById("AESEncrypt").onclick = AESCiphering_outlook;
    document.getElementById("AESDeciphering").onclick = AESDeciphering_outlook;
  }
});

function genError(error_message) {
  document.getElementById("output").textContent=error_message;
}

/**
 * Retrieves the content of a file if available.
 * 
 * This function checks if `fileContent` is defined from keyreader.js and returns it. If `fileContent` is not available, 
 * it logs a message to the console indicating that no file content is available.
 * 
 * @returns {string|undefined} The content of the file if available, otherwise undefined.
 */
function useFileContent() {
  if (fileContent) {
    return fileContent;
  } else {
      console.log("No file content available.");
      return false;
  }
}

/**
 * Downloads a file with content from a variable.
 * @param {string} fileName - The name of the file to be downloaded.
 * @param {string} fileCont - The content to be written into the file.
 */
function downloadFileFromVariable(fileName, fileCont) {
  // Create a Blob object from the variable's content
  let blob = new Blob([fileCont], { type: 'text/plain' });

  // Create a temporary anchor element
  let link = document.createElement('a');
  link.download = fileName; // Set the file name
  link.href = URL.createObjectURL(blob); // Create a URL for the Blob

  // Append the link to the document, click it, then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads multiple files from an array of objects containing file names and content.
 * @param {Array} files - An array of objects with { fileName, fileContent }.
 * @param {number} delay - Optional delay between downloads (default: 500ms).
 */
function downloadMultipleFiles(files, delay = 500) {
  files.forEach((file, index) => {
      setTimeout(() => {
          let blob = new Blob([file.fileCont], { type: 'text/plain' });
          let link = document.createElement('a');
          link.download = file.fileName;
          link.href = URL.createObjectURL(blob);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }, index * delay); // Stagger downloads to avoid browser blocking
  });
}


//KYBER CODE

/**
 * Generates Kyber encryption keys and triggers a download of the keys as text files.
 * 
 * This asynchronous function generates a pair of Kyber encryption keys (public and secret), 
 * then creates a list of files containing these keys. It triggers the download of both the 
 * public key and the secret key as `.txt` files using the `downloadMultipleFiles` function.
 * 
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the files have been queued for download.
 */
async function genKyberKeys_outlook() {
  const [public_key, secret_key]= await kyberGenKeys();
  let filesToDownload = [
    { fileName: "SK_kyber.txt", fileCont: secret_key },
    { fileName: "PK_kyber.txt", fileCont: public_key }
  ];
  downloadMultipleFiles(filesToDownload);
}

/**
 * Inserts a message into the body of an email in Outlook.
 * 
 * This asynchronous function sets the body of the current email item to the specified message. 
 * If the message is empty or invalid, it does not modify the email content.
 * 
 * @async
 * @function
 * @param {string} message - The message to insert into the email body.
 * @returns {void} 
 */
async function insertMessageIntoEmail(message) {
  const item = Office.context.mailbox.item;

  if (!message) {
    console.error("Message is empty. Nothing to insert.");
    return;
  }

  item.body.setAsync(message, { coercionType: Office.CoercionType.Text }, function (setResult) {
    if (setResult.status === Office.AsyncResultStatus.Succeeded) {
      console.log("Email content replaced successfully.");
    } else {
      console.error("Error setting email content:", setResult.error);
    }
  });
}

/**
 * Generates Kyber ciphertext and a shared secret key (SSK) for a recipient, then inserts the ciphertext into an email.
 * 
 * This asynchronous function retrieves the recipient's public key from a file, generates the Kyber ciphertext 
 * and shared secret key (SSK) using the public key, and then triggers the download of the SSK as a `.txt` file. 
 * Finally, it inserts the generated ciphertext into the body of the current email.
 * 
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the ciphertext is inserted into the email 
 * and the SSK is downloaded.
 */
async function genKyberCiphertext_outlook() {
  const reciver_pk=useFileContent();
  if (reciver_pk == false) {
    genError("Nebyl nahrán klíč");
  }
  else if (reciver_pk.length != 2368 ) {
    genError("Byl zvolen špatný klíč");
  }
  else {
    const [ciphertext, SSK] = await kyberGenCiphertext_SSK(reciver_pk);
    downloadFileFromVariable("SSK.txt", SSK);
    await insertMessageIntoEmail(ciphertext);
  }
  
  // const [ciphertext, SSK] = await kyberGenCiphertext_SSK(reciver_pk);
  // downloadFileFromVariable("SSK.txt", SSK);
  // await insertMessageIntoEmail(ciphertext);
}


async function getEmailBody() {
  return new Promise((resolve, reject) => {
    const item = Office.context.mailbox.item;

    item.body.getAsync(Office.CoercionType.Text, function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        resolve(result.value); // Properly return the encrypted message
      } else {
        reject("Error retrieving email body: " + result.error.message);
      }
    });
  });
}


/**
 * Deciphers Kyber ciphertext and generates the shared secret key (SSK) for the recipient.
 * 
 * This asynchronous function retrieves the recipient's secret key and the ciphertext from an email, 
 * then generates the shared secret key (SSK) by decrypting the ciphertext. Afterward, it triggers 
 * the download of the SSK as a `.txt` file.
 * 
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the SSK has been successfully generated and downloaded.
 */
async function decipherKyberCiphertext_outlook() {
  const reciever_sk=useFileContent();
  if (reciever_sk == false) {
    genError("Nebyl nahrán klíč");
  }
  else if (reciever_sk.length != 4800 ) {
    genError("Byl zvolen špatný klíč");
  }
  else {
    const ciphertext_email= await getEmailBody();
    const SSK = await kyberDecipherCiphertext(ciphertext_email, reciever_sk);
    downloadFileFromVariable("SSK.txt", SSK);
  }
}

//END OF KYBER CODE
//AES CODE

// Funkce pro zkopírování obsahu emailu a otevření v novém okně FUNGUJE TO, JSME SPOKOJENÍ?
function copyContentAndOpenNewWindow() {
  // Zkontrolujeme, zda je otevřený email
  var item = Office.context.mailbox.item;
  if (item) {
    // Získáme obsah těla emailu jako HTML nebo text
    item.body.getAsync('html', function(result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        var emailContent = result.value;

        // Otevřeme nové okno a do něj vložíme obsah
        var newWindow = window.open('', '_blank');
        newWindow.document.write(emailContent);
        newWindow.document.close();
      } else {
        console.error('Chyba při získávání obsahu: ' + result.error.message);
      }
    });
  } else {
    console.error('Žádný otevřený email.');
  }
}

// #######################################################


/**
 * Encrypts the body of an email using AES encryption and replaces the email content with the encrypted message.
 * 
 * This asynchronous function retrieves the current email body, performs AES encryption on the content, 
 * and replaces the email body with the encrypted message. It uses a randomly generated IV (Initialization Vector) 
 * and a key from a file for the encryption process.
 * 
 * @async
 * @function
 * @returns {void} This function does not return a value but modifies the email content directly.
 */
async function AESCiphering_outlook() {
  const key=useFileContent();
  if (key == false) {
    genError("Nebyl nahrán klíč");
  }
  else if (key.length != 64 ) {
    genError("Byl zvolen špatný klíč");
  }
  else {
    const item = Office.context.mailbox.item;

    // Step 1: Retrieve the current email body
    item.body.getAsync(Office.CoercionType.Text, function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        let open_text = result.value; // Get the email content
        
        if (!open_text) {
          console.error("Email body is empty. Nothing to encrypt.");
          return;
        }
  
        // Step 2: Encrypt the email body
        let iv = AESgenerateIV(); 
        // let key = useFileContent();
        let ciphertext = AES_Encrypt(open_text, key, iv);
  
        // Step 3: Replace the email body with the encrypted content
        let encryptedMessage = `IV: ${iv}\nCiphertext: ${ciphertext}`;
        item.body.setAsync(encryptedMessage, { coercionType: Office.CoercionType.Text }, function (setResult) {
          if (setResult.status === Office.AsyncResultStatus.Succeeded) {
            console.log("Email content replaced with encrypted message.");
          } else {
            console.error("Error setting email content:", setResult.error);
          }
        });
  
      } else {
        console.error("Error retrieving email body:", result.error);
      }
    });
  }
}


/**
 * Decrypts the body of an email that was encrypted using AES encryption and displays the decrypted content.
 * 
 * This asynchronous function retrieves the current email body, extracts the IV (Initialization Vector) 
 * and ciphertext from the encrypted message, decrypts the content using AES, and then opens the decrypted 
 * content in a new browser window.
 * 
 * @async
 * @function
 * @returns {void} This function does not return a value but displays the decrypted content in a new window.
 */
async function AESDeciphering_outlook() {
  const key=useFileContent();
  if (key == false) {
    genError("Nebyl nahrán klíč");
  }
  else if (key.length != 64 ) {
    genError("Byl zvolen špatný klíč");
  }
  else {
    const item = Office.context.mailbox.item;

    // Step 1: Retrieve the current email body
    item.body.getAsync(Office.CoercionType.Text, function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        let encryptedMessage = result.value; // Get the encrypted content
        
        if (!encryptedMessage) {
          console.error("Email body is empty. Nothing to decrypt.");
          return;
        }
  
        // Step 2: Extract IV and ciphertext
        let match = encryptedMessage.match(/IV:\s*(\w+)\s*Ciphertext:\s*([\w+/=]+)/);
        if (!match) {
          console.error("Invalid encrypted format. Decryption failed.");
          return;
        }
  
        let iv = match[1]; // Extracted IV
        let ciphertext = match[2]; // Extracted encrypted content
        
        // Step 3: Decrypt the message
        let decryptedText = AES_Decrypt(ciphertext, key, iv);
  
        var newWindow = window.open('', '_blank');
        newWindow.document.write(decryptedText);
        newWindow.document.close();
  
      } else {
        console.error("Error retrieving email body:", result.error);
      }
    });
  }
}
