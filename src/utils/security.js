// ---------------------------------------------------------------
// Utilidades de seguridad (Unidad 3)
// - Hash de contraseñas con PBKDF2 + sal aleatoria (Web Crypto API)
// - Comparación en tiempo constante
// - Sanitización básica de texto
// ---------------------------------------------------------------

const ITERATIONS = 210_000; // recomendación OWASP para PBKDF2-SHA256

const bytesToHex = (bytes) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

const hexToBytes = (hex) =>
  new Uint8Array(hex.match(/.{2}/g).map((h) => parseInt(h, 16)));

export function randomSalt() {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

// Evita filtrar información por diferencias de tiempo entre comparaciones.
export function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// React ya escapa el HTML al renderizar; esto es una capa extra al guardar datos.
export function sanitize(text = '') {
  return String(text)
    .replace(/[<>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
