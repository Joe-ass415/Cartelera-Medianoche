import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { lockRemaining } from '../services/auth';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/cartelera';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(lockRemaining());

  // Cuenta regresiva mientras el login está bloqueado.
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(lockRemaining()), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  if (user) return <Navigate to={from} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setBusy(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.message === 'LOCKED') {
        setSeconds(err.seconds);
        setError('Demasiados intentos. Por seguridad, espera para volver a intentar.');
      } else {
        setError(`Correo o contraseña incorrectos. Te quedan ${err.left} intentos.`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="wrap auth-page">
      <div className="auth-side">
        <p className="eyebrow">Acceso a sala</p>
        <h1>Muestra tu boleto.</h1>
        <p className="lead">Inicia sesión para entrar a la cartelera.</p>
        {location.state?.from && (
          <p className="notice">Esa sala es solo para socios. Inicia sesión para continuar.</p>
        )}
        <p className="side-link">
          ¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>

      <form className="card form" onSubmit={onSubmit} noValidate>
        <Field id="email" label="Correo electrónico">
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        <Field id="password" label="Contraseña">
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>

        {error && <p className="error form-error" role="alert">⚠ {error}</p>}
        {seconds > 0 && <p className="lock">Bloqueado por {seconds} s</p>}

        <button className="btn btn-block" type="submit" disabled={busy || seconds > 0}>
          {busy ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}
