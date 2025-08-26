// utils/secureStorage.js

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SECRET_KEY_RAW = "W4CySVq+zq5LWjzwG7njw7CsohzRCHGe"; // 🔐 32 caracteres para AES-256
const ALGORITHM = "AES-GCM";

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET_KEY_RAW),
    { name: ALGORITHM },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function saveEncrypted(key, value) {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = encoder.encode(JSON.stringify(value));
    const cryptoKey = await getKey();

    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      cryptoKey,
      encoded
    );
    const encryptedData = {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    };
    localStorage.setItem(key, JSON.stringify(encryptedData));
  } catch (err) {
    console.error("❌ Error al guardar encriptado:", err);
  }
}

export async function getEncrypted(key) {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    const { iv, data } = JSON.parse(item);
    const cryptoKey = await getKey();

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: new Uint8Array(iv) },
      cryptoKey,
      new Uint8Array(data)
    );

    return JSON.parse(decoder.decode(decrypted));
  } catch (err) {
    console.log("❌ Error al desencriptar:", err);
    return null;
  }
}

export function removeEncrypted(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error("❌ Error al eliminar clave:", err);
  }
}
