# Cineclub Medianoche

Proyecto de la **Unidad 3** (seguridad, web services y APIs). Página hecha con **React + Vite** sobre un cineclub nocturno que consume la API gratuita de **TMDB**.

## Pantallas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Inicio | Público |
| `/registro` | Registro de usuario con validación | Público |
| `/login` | Inicio de sesión | Público |
| `/cartelera` | Información de películas (API TMDB) | **Solo con sesión** |

## Cómo correrlo

```bash
npm install
cp .env.example .env     # en Windows: copy .env.example .env
# abre .env y pega tu API Key de TMDB
npm run dev
```

Clave gratis: crea una cuenta en <https://www.themoviedb.org>, ve a *Settings → API* y copia la **API Key (v3 auth)**.

> Después de editar `.env` hay que **reiniciar** `npm run dev`.

## Qué de la Unidad 3 incluye

**Seguridad**
- Validación de cada campo del registro (nombre, correo, teléfono, edad, contraseña, confirmación y términos), en vivo y al enviar.
- Contraseñas con **PBKDF2 + sal aleatoria** (Web Crypto API, 210,000 iteraciones). Nunca se guarda la contraseña real.
- Comparación de hashes en tiempo constante y mensaje de error genérico en el login.
- **Bloqueo de 60 s tras 5 intentos fallidos** (anti fuerza bruta).
- **Honeypot** en el registro contra bots.
- **Ruta protegida** (`/cartelera`) con redirección al login.
- React escapa el HTML por defecto; no se usa `dangerouslySetInnerHTML`. Además se sanitiza el texto antes de guardarlo.
- La sesión solo guarda datos no sensibles (nada de hash ni sal).

**Web services / APIs**
- Consumo REST de TMDB con `fetch`: tendencias, mejor valoradas, próximos estrenos, búsqueda y detalle con tráiler.
- Estados de carga, errores amigables (sin clave, clave inválida, límite de peticiones, sin internet), `AbortController` y *debounce* en la búsqueda.

**Variables de entorno**
- La clave está en `.env` (`VITE_TMDB_API_KEY`), que aparece en `.gitignore`. Solo se sube `.env.example`.

## Antes de subir a GitHub

```bash
git status          # .env NO debe aparecer en la lista
git add .
git commit -m "Cineclub Medianoche"
```

Si por error subiste tu clave alguna vez, **genera una nueva** en TMDB; borrarla del repo no basta porque queda en el historial.

## Notas honestas (para defender el proyecto)

- Las variables `VITE_*` se incluyen en el JavaScript final, así que cualquiera que abra las DevTools del sitio publicado podría verla. Para una clave realmente secreta se usa un **backend/proxy** que guarde la clave y haga las peticiones por ti. Para una API gratuita de solo lectura como TMDB es un riesgo aceptable en un proyecto escolar.
- Los usuarios se guardan en `localStorage` solo para la demostración. En un sistema real irían en una base de datos del servidor, con HTTPS, tokens de sesión (JWT o cookies `HttpOnly`) y límites de intentos del lado del servidor.

## Estructura

```
src/
  components/   Header, Footer, Field
  context/      AuthContext (sesión)
  pages/        Home, Register, Login, Cartelera
  services/     auth.js (usuarios/sesión), tmdb.js (API)
  utils/        security.js (hash), validators.js (reglas)
  styles.css
```
