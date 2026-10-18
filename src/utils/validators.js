// Reglas de validación del formulario de registro.
// Cada regla recibe el valor (y todos los valores del form) y regresa un mensaje de error o ''.

const NAME_RE = /^[\p{L}][\p{L}\s'.-]{1,39}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\d{10}$/;

export const GENRES = [
  'Terror',
  'Ciencia ficción',
  'Suspenso',
  'Drama',
  'Comedia negra',
  'Animación',
  'Documental',
];

function ageFrom(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return { age, date: d };
}

export const passwordChecks = (p = '') => [
  { ok: p.length >= 8, label: '8 caracteres o más' },
  { ok: /[a-z]/.test(p), label: 'Una minúscula' },
  { ok: /[A-Z]/.test(p), label: 'Una mayúscula' },
  { ok: /\d/.test(p), label: 'Un número' },
  { ok: /[^A-Za-z0-9]/.test(p), label: 'Un símbolo (!@#$…)' },
];

export const passwordScore = (p) => passwordChecks(p).filter((c) => c.ok).length;

export const rules = {
  nombre: (v) => {
    if (!v.trim()) return 'Escribe tu nombre.';
    if (!NAME_RE.test(v.trim())) return 'Solo letras y espacios (de 2 a 40 caracteres).';
    return '';
  },
  email: (v) => {
    if (!v.trim()) return 'Escribe tu correo.';
    if (!EMAIL_RE.test(v.trim())) return 'Ese correo no parece válido (ej. nombre@correo.com).';
    return '';
  },
  telefono: (v) => {
    if (!v) return ''; // opcional
    return PHONE_RE.test(v.replace(/[\s-]/g, '')) ? '' : 'Debe tener 10 dígitos.';
  },
  nacimiento: (v) => {
    if (!v) return 'Selecciona tu fecha de nacimiento.';
    const r = ageFrom(v);
    if (!r) return 'Fecha inválida.';
    if (r.date > new Date()) return 'La fecha no puede ser futura.';
    if (r.age > 110) return 'Revisa el año de nacimiento.';
    if (r.age < 13) return 'Necesitas tener al menos 13 años.';
    return '';
  },
  genero: (v) => (v ? '' : 'Elige tu género favorito.'),
  password: (v) => {
    if (!v) return 'Crea una contraseña.';
    if (passwordScore(v) < 5) return 'Aún no cumple todos los requisitos.';
    if (v.length > 64) return 'Máximo 64 caracteres.';
    return '';
  },
  confirm: (v, all) => {
    if (!v) return 'Repite tu contraseña.';
    return v === all.password ? '' : 'Las contraseñas no coinciden.';
  },
  terms: (v) => (v ? '' : 'Debes aceptar el aviso de privacidad.'),
};

export function validateAll(values) {
  const errors = {};
  for (const key of Object.keys(rules)) {
    const msg = rules[key](values[key], values);
    if (msg) errors[key] = msg;
  }
  return errors;
}
