// ---------------------------------------------------------------
// Web service / API externa: The Movie Database (TMDB) – gratis.
// La clave se lee de variables de entorno (.env), nunca va escrita en el código.
// ---------------------------------------------------------------
const BASE = 'https://api.themoviedb.org/3';
const KEY = import.meta.env.VITE_TMDB_API_KEY;

export const IMG = 'https://image.tmdb.org/t/p/';

export const hasKey = () => Boolean(KEY) && KEY !== 'tu_api_key_aqui';

async function request(path, params = {}, signal) {
  if (!hasKey()) throw new Error('NO_KEY');

  const url = new URL(BASE + path);
  url.searchParams.set('api_key', KEY);
  url.searchParams.set('language', 'es-MX');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const res = await fetch(url, { signal });
  if (res.status === 401) throw new Error('BAD_KEY');
  if (res.status === 429) throw new Error('RATE_LIMIT');
  if (!res.ok) throw new Error('HTTP_' + res.status);
  return res.json();
}

export const getTrending = (page = 1, signal) =>
  request('/trending/movie/week', { page }, signal);

export const getTopRated = (page = 1, signal) =>
  request('/movie/top_rated', { page, region: 'MX' }, signal);

export const getUpcoming = (page = 1, signal) =>
  request('/movie/upcoming', { page, region: 'MX' }, signal);

export const searchMovies = (query, page = 1, signal) =>
  request('/search/movie', { query, page, include_adult: 'false' }, signal);

export const getMovie = (id, signal) =>
  request(`/movie/${id}`, { append_to_response: 'videos' }, signal);

export function friendlyError(err) {
  switch (err.message) {
    case 'NO_KEY':
      return 'Falta la clave de la API. Crea el archivo .env (mira .env.example) y reinicia npm run dev.';
    case 'BAD_KEY':
      return 'TMDB rechazó la clave. Revisa que VITE_TMDB_API_KEY sea tu API Key v3.';
    case 'RATE_LIMIT':
      return 'Demasiadas peticiones. Espera unos segundos e intenta otra vez.';
    default:
      return 'No pudimos conectar con TMDB. Revisa tu internet e intenta de nuevo.';
  }
}
