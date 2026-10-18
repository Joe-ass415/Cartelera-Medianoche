import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Cineclub Medianoche, inicio">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="var(--gold)" stroke="var(--ink)" strokeWidth="3" />
        <circle cx="21" cy="12" r="11" fill="var(--ink)" />
      </svg>
      <span>MEDIA<b>NOCHE</b></span>
    </Link>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Logo />
        <nav aria-label="Principal">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/cartelera">Cartelera</NavLink>
          {!user && <NavLink to="/registro">Registro</NavLink>}
        </nav>
        <div className="header-user">
          {user ? (
            <>
              <span className="hello">Hola, {user.nombre.split(' ')[0]}</span>
              <button
                className="btn btn-small btn-ghost"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-small">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
}
