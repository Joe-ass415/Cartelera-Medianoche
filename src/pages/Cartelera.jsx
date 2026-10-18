import { useEffect, useRef, useState } from 'react';
import {
  IMG,
  friendlyError,
  getMovie,
  getTopRated,
  getTrending,
  getUpcoming,
  hasKey,
  searchMovies,
} from '../services/tmdb';
import { useAuth } from '../context/AuthContext.jsx';

const TABS = [
  { id: 'trending', label: 'En tendencia', fn: getTrending },
  { id: 'top', label: 'Mejor valoradas', fn: getTopRated },
  { id: 'soon', label: 'Próximamente', fn: getUpcoming },
];

function useDebounced(value, ms = 450) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function MovieModal({ id, onClose }) {
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');
  const closeRef = useRef(null);

  useEffect(() => {
    const ctrl = new AbortController();
    getMovie(id, ctrl.signal)
      .then(setMovie)
      .catch((e) => e.name !== 'AbortError' && setError(friendlyError(e)));
    return () => ctrl.abort();
  }, [id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const trailer = movie?.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer');

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Detalle de la película" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        {error && <p className="notice">{error}</p>}
        {!movie && !error && <p className="muted">Cargando…</p>}
        {movie && (
          <div className="modal-body">
            {movie.poster_path && <img src={`${IMG}w500${movie.poster_path}`} alt={`Póster de ${movie.title}`} />}
            <div>
              <p className="eyebrow">{movie.release_date?.slice(0, 4) || 's/f'} · {movie.runtime ? `${movie.runtime} min` : 'duración n/d'}</p>
              <h3>{movie.title}</h3>
              {movie.tagline && <p className="tagline">“{movie.tagline}”</p>}
              <ul className="chips">
                {movie.genres?.map((g) => <li key={g.id}>{g.name}</li>)}
              </ul>
              <p>{movie.overview || 'Sin sinopsis disponible en español.'}</p>
              <p className="score-line">★ {movie.vote_average?.toFixed(1)} <span>({movie.vote_count} votos)</span></p>
              {trailer && (
                <a className="btn btn-small" href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer">
                  Ver tráiler ↗
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Cartelera() {
  const { user } = useAuth();
  const [tab, setTab] = useState('trending');
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query.trim());
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  // Al cambiar pestaña o búsqueda, reiniciamos la lista.
  useEffect(() => {
    setPage(1);
    setMovies([]);
  }, [tab, debounced]);

  useEffect(() => {
    if (!hasKey()) {
      setStatus('error');
      setError(friendlyError(new Error('NO_KEY')));
      return;
    }
    const ctrl = new AbortController();
    setStatus('loading');
    const req = debounced
      ? searchMovies(debounced, page, ctrl.signal)
      : TABS.find((t) => t.id === tab).fn(page, ctrl.signal);

    req
      .then((d) => {
        setMovies((prev) => (page === 1 ? d.results : [...prev, ...d.results]));
        setTotalPages(d.total_pages);
        setStatus('ok');
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setError(friendlyError(e));
        setStatus('error');
      });
    return () => ctrl.abort();
  }, [tab, debounced, page]);

  const visible = movies.filter((m) => m.poster_path);

  return (
    <div className="theater">
      <div className="wrap section">
        <p className="eyebrow light">Sala 1 · Bienvenid@, {user.nombre.split(' ')[0]}</p>
        <h1>Cartelera</h1>

        <div className="toolbar">
          <div className="tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={!debounced && tab === t.id}
                className={!debounced && tab === t.id ? 'active' : ''}
                onClick={() => {
                  setQuery('');
                  setTab(t.id);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="search">
            <label htmlFor="q" className="sr">Buscar película</label>
            <input
              id="q"
              type="search"
              placeholder="Buscar una película…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={80}
            />
          </div>
        </div>

        {status === 'error' && <p className="notice dark">{error}</p>}

        {status !== 'error' && (
          <>
            {debounced && <p className="muted light">Resultados para “{debounced}”</p>}
            {status === 'ok' && visible.length === 0 && <p className="muted light">No encontramos nada con ese título.</p>}

            <ul className="grid">
              {visible.map((m) => (
                <li key={m.id}>
                  <button className="poster" onClick={() => setSelected(m.id)} aria-label={`Ver detalles de ${m.title}`}>
                    <img src={`${IMG}w342${m.poster_path}`} alt="" loading="lazy" />
                    <span className="rating">{m.vote_average ? m.vote_average.toFixed(1) : '–'}</span>
                    <span className="poster-title">{m.title}</span>
                  </button>
                </li>
              ))}
            </ul>

            {status === 'loading' && <p className="muted light">Proyectando…</p>}
            {status === 'ok' && page < totalPages && (
              <div className="more">
                <button className="btn btn-light" onClick={() => setPage((p) => p + 1)}>Cargar más</button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <MovieModal id={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
