import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IMG, getTrending, hasKey } from '../services/tmdb';
import { useAuth } from '../context/AuthContext.jsx';

const MARQUEE = ['FUNCIÓN DE MEDIANOCHE', 'TERROR', 'CIENCIA FICCIÓN', 'SUSPENSO', 'CINE DE CULTO', 'SIN DORMIR'];

const STEPS = [
  { n: '01', t: 'Saca tu boleto', d: 'Crea tu cuenta en menos de un minuto. Tus datos se validan antes de guardarse.' },
  { n: '02', t: 'Entra a la sala', d: 'Inicia sesión para desbloquear la cartelera. Sin boleto no hay función.' },
  { n: '03', t: 'Elige tu película', d: 'Explora lo que está en tendencia, lo mejor valorado y busca cualquier título.' },
];

const BACKSTAGE = [
  ['Validación de formularios', 'Reglas por campo, mensajes claros y revisión final antes de enviar.'],
  ['Contraseñas con hash', 'PBKDF2 + sal aleatoria con Web Crypto. Nunca se guarda la contraseña real.'],
  ['Rutas protegidas', 'La cartelera solo abre con sesión activa y redirige al login si no la hay.'],
  ['Anti-fuerza bruta', 'Tras 5 intentos fallidos el login se bloquea 60 segundos.'],
  ['API externa (TMDB)', 'Consumo de un web service REST con fetch, estados de carga y manejo de errores.'],
  ['Claves en .env', 'La API key vive en un archivo ignorado por Git, con un .env.example de guía.'],
];

export default function Home() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!hasKey()) {
      setStatus('nokey');
      return;
    }
    const ctrl = new AbortController();
    getTrending(1, ctrl.signal)
      .then((d) => {
        setMovies(d.results.filter((m) => m.poster_path).slice(0, 5));
        setStatus('ok');
      })
      .catch((e) => e.name !== 'AbortError' && setStatus('error'));
    return () => ctrl.abort();
  }, []);

  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">Cineclub · Sala única · 00:00 h</p>
          <h1>
            Cine para
            <br />
            los que <em>no</em>
            <br />
            duermen.
          </h1>
          <p className="lead">
            Una función cada noche, solo para insomnes con buen gusto. Regístrate, entra a la sala y descubre qué se está
            proyectando en el mundo esta semana.
          </p>
          <div className="hero-cta">
            {user ? (
              <Link to="/cartelera" className="btn">Ir a la cartelera →</Link>
            ) : (
              <>
                <Link to="/registro" className="btn">Sacar mi boleto</Link>
                <Link to="/login" className="btn btn-ghost">Ya tengo cuenta</Link>
              </>
            )}
          </div>
        </div>

        <aside className="ticket" aria-label="Boleto decorativo">
          <div className="ticket-main">
            <span className="ticket-tag">Admit one</span>
            <strong>SALA 1</strong>
            <span>Función única</span>
            <span className="ticket-time">00:00</span>
          </div>
          <div className="ticket-stub">
            <span>Nº</span>
            <b>0001</b>
          </div>
        </aside>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i}>{t} <i>✦</i></span>
          ))}
        </div>
      </div>

      <section className="wrap section">
        <div className="section-head">
          <h2>En cartel esta semana</h2>
          <span className="stamp-label">vía TMDB</span>
        </div>

        {status === 'loading' && <p className="muted">Proyectando…</p>}
        {status === 'nokey' && (
          <p className="notice">
            Aquí se mostrarían los estrenos de la semana. Falta configurar tu clave de TMDB en el archivo <code>.env</code>.
          </p>
        )}
        {status === 'error' && <p className="notice">No se pudo cargar la cartelera ahora mismo.</p>}
        {status === 'ok' && (
          <ul className="posters-row">
            {movies.map((m, i) => (
              <li key={m.id} style={{ '--tilt': `${(i % 2 ? 1 : -1) * (1 + i * 0.4)}deg` }}>
                <img src={`${IMG}w342${m.poster_path}`} alt={`Póster de ${m.title}`} loading="lazy" />
                <span>{m.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Cómo funciona</h2>
        </div>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="backstage">
        <div className="wrap section">
          <div className="section-head">
            <h2>Detrás de cámaras</h2>
            <span className="stamp-label">Unidad 3</span>
          </div>
          <p className="lead light">Lo que hace funcionar esta página por dentro: seguridad, web services y APIs.</p>
          <dl className="backstage-grid">
            {BACKSTAGE.map(([t, d]) => (
              <div key={t}>
                <dt>{t}</dt>
                <dd>{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
