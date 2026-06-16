import crypto from 'crypto';

/**
 * @description Generate a random alpha numeric string for use as a API key
 * @example bun run utils/keyGenerator.ts
 * @returns The string printed in terminal
 */
function generarApiKey() {
    const apiKey:string = crypto.randomBytes(32).toString('hex');
    console.log("API-KEY", apiKey);
    console.log("Guardala en el .env");
    return apiKey;
}

generarApiKey();