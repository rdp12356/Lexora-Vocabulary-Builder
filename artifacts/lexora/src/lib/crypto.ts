const encoder = new TextEncoder();
const decoder = new TextDecoder();

const VAULT_MARKER_PREFIX = "lexora:vault:marker:";
const PBKDF2_ITERATIONS = 250_000;

export type VaultWordRecord = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: string;
  status: "known" | "unknown" | null;
};

export type VaultExampleRecord = {
  id: number;
  wordId: number;
  type: "casual" | "professional";
  sentence: string;
};

function toBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function storageKey(prefix: string, userId: string) {
  return `${prefix}${userId}`;
}

function requireWindow() {
  if (typeof window === "undefined") {
    throw new Error("Vault operations require a browser environment");
  }

  return window;
}

export function hasVaultMarker(userId: string) {
  return requireWindow().localStorage.getItem(storageKey(VAULT_MARKER_PREFIX, userId)) !== null;
}

export function getOrCreateVaultSalt(userId: string) {
  return encoder.encode(`lexora:vault:salt:${userId}`);
}

export async function deriveVaultKey(passphrase: string, salt: Uint8Array) {
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptText(plaintext: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext),
  );

  const payload = new Uint8Array(iv.length + ciphertext.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(ciphertext), iv.length);
  return toBase64(payload);
}

export async function decryptText(payload: string, key: CryptoKey) {
  const bytes = fromBase64(payload);
  const iv = bytes.slice(0, 12);
  const ciphertext = bytes.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return decoder.decode(decrypted);
}

export async function createVaultMarker(userId: string, key: CryptoKey) {
  const marker = await encryptText("lexora-vault-ready", key);
  requireWindow().localStorage.setItem(storageKey(VAULT_MARKER_PREFIX, userId), marker);
}

export async function verifyVaultMarker(userId: string, key: CryptoKey) {
  const marker = requireWindow().localStorage.getItem(storageKey(VAULT_MARKER_PREFIX, userId));

  if (!marker) {
    await createVaultMarker(userId, key);
    return true;
  }

  return (await decryptText(marker, key)) === "lexora-vault-ready";
}

export async function encryptVaultWord(word: VaultWordRecord, key: CryptoKey): Promise<VaultWordRecord> {
  return {
    ...word,
    word: await encryptText(word.word, key),
    meaning: await encryptText(word.meaning, key),
  };
}

export async function decryptVaultWord(word: VaultWordRecord, key: CryptoKey): Promise<VaultWordRecord> {
  return {
    ...word,
    word: await decryptText(word.word, key),
    meaning: await decryptText(word.meaning, key),
  };
}

export async function decryptVaultWords(words: VaultWordRecord[], key: CryptoKey) {
  return Promise.all(words.map((word) => decryptVaultWord(word, key)));
}

export async function decryptVaultExamples<T extends VaultExampleRecord>(examples: T[], _key: CryptoKey) {
  return examples;
}
