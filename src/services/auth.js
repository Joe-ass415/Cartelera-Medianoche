// ---------------------------------------------------------------
// Autenticación DEMO (solo front-end).
// Guarda usuarios en localStorage con la contraseña hasheada (PBKDF2 + sal).
// En un proyecto real esto vive en un servidor con base de datos.
// ---------------------------------------------------------------
import { hashPassword, randomSalt, safeEqual, sanitize } from '../utils/security';

const USERS_KEY = 'mm_users';
const SESSION_KEY = 'mm_session';
const LOCK_KEY = 'mm_lock';
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

function readJSON(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const readUsers = () => readJSON(localStorage, USERS_KEY, []);
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

// Solo guardamos datos no sensibles en la sesión (nunca hash ni sal).
const publicUser = (u) => ({ id: u.id, nombre: u.nombre, email: u.email, genero: u.genero });

function startSession(user) {
  const session = publicUser(user);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export const getSession = () => readJSON(sessionStorage, SESSION_KEY, null);
export const logout = () => sessionStorage.removeItem(SESSION_KEY);

export async function registerUser(data) {
  const users = readUsers();
  const email = data.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error('EMAIL_TAKEN');
  }
  const salt = randomSalt();
  const hash = await hashPassword(data.password, salt);
  const user = {
    id: crypto.randomUUID(),
    nombre: sanitize(data.nombre),
    email,
    telefono: data.telefono.replace(/[\s-]/g, ''),
    nacimiento: data.nacimiento,
    genero: data.genero,
    salt,
    hash,
    creado: Date.now(),
  };
  saveUsers([...users, user]);
  return startSession(user);
}

export function lockRemaining() {
  const lock = readJSON(localStorage, LOCK_KEY, { attempts: 0, until: 0 });
  return Math.max(0, Math.ceil((lock.until - Date.now()) / 1000));
}

export async function loginUser(emailRaw, password) {
  const wait = lockRemaining();
  if (wait > 0) {
    const err = new Error('LOCKED');
    err.seconds = wait;
    throw err;
  }

  const email = emailRaw.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === email);

  // Siempre hacemos el hash, exista o no el usuario, para no revelar cuál correo está registrado.
  const salt = user ? user.salt : '00'.repeat(16);
  const hash = await hashPassword(password, salt);
  const ok = user && safeEqual(hash, user.hash);

  if (!ok) {
    const lock = readJSON(localStorage, LOCK_KEY, { attempts: 0, until: 0 });
    const attempts = lock.attempts + 1;
    const next =
      attempts >= MAX_ATTEMPTS
        ? { attempts: 0, until: Date.now() + LOCK_MS }
        : { attempts, until: 0 };
    localStorage.setItem(LOCK_KEY, JSON.stringify(next));
    const err = new Error(attempts >= MAX_ATTEMPTS ? 'LOCKED' : 'BAD_CREDENTIALS');
    err.seconds = attempts >= MAX_ATTEMPTS ? LOCK_MS / 1000 : 0;
    err.left = MAX_ATTEMPTS - attempts;
    throw err;
  }

  localStorage.removeItem(LOCK_KEY);
  return startSession(user);
}
