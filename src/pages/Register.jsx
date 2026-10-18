import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { GENRES, passwordChecks, passwordScore, rules, validateAll } from '../utils/validators';

const INITIAL = {
  nombre: '',
  email: '',
  telefono: '',
  nacimiento: '',
  genero: '',
  password: '',
  confirm: '',
  terms: false,
  website: '', // honeypot anti-bots: un humano nunca lo ve ni lo llena
};

const STRENGTH = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Excelente'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const score = passwordScore(values.password);

  const validateField = (name, vals) => rules[name]?.(vals[name], vals) ?? '';

  function onChange(e) {
    const { name, type, value, checked } = e.target;
    const next = { ...values, [name]: type === 'checkbox' ? checked : value };
    setValues(next);
    // Una vez tocado el campo, validamos en vivo.
    if (touched[name] || name === 'password') {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, next),
        ...(name === 'password' && touched.confirm ? { confirm: validateField('confirm', next) } : {}),
      }));
    }
  }

  function onBlur(e) {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, values) }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (values.website) return; // bot detectado: ignoramos en silencio

    const found = validateAll(values);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(rules).map((k) => [k, true])));
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      document.getElementById(first)?.focus();
      return;
    }

    setBusy(true);
    try {
      await register(values);
      navigate('/cartelera', { replace: true });
    } catch (err) {
      if (err.message === 'EMAIL_TAKEN') {
        setErrors({ email: 'Ya existe una cuenta con ese correo. ¿Quieres iniciar sesión?' });
        document.getElementById('email')?.focus();
      } else {
        setFormError('No se pudo crear la cuenta. Intenta de nuevo.');
      }
    } finally {
      setBusy(false);
    }
  }

  const aria = (name) => ({
    id: name,
    name,
    onChange,
    onBlur,
    'aria-invalid': errors[name] ? 'true' : 'false',
    'aria-describedby': `${name}-msg`,
  });

  return (
    <section className="wrap auth-page">
      <div className="auth-side">
        <p className="eyebrow">Boletería</p>
        <h1>Saca tu boleto.</h1>
        <p className="lead">
          Con tu cuenta puedes entrar a la cartelera, buscar películas y ver los detalles de cada función.
        </p>
        <p className="side-note">
          Tu contraseña se convierte en un hash con sal antes de guardarse. Nadie, ni esta página, puede leerla después.
        </p>
        <p className="side-link">
          ¿Ya tienes boleto? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>

      <form className="card form" onSubmit={onSubmit} noValidate autoComplete="on">
        {/* Honeypot */}
        <div className="hp" aria-hidden="true">
          <label htmlFor="website">No llenar este campo</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={onChange} />
        </div>

        <Field id="nombre" label="Nombre completo" error={errors.nombre}>
          <input {...aria('nombre')} type="text" value={values.nombre} autoComplete="name" maxLength={40} placeholder="Ana López" />
        </Field>

        <div className="two-cols">
          <Field id="email" label="Correo electrónico" error={errors.email}>
            <input {...aria('email')} type="email" value={values.email} autoComplete="email" placeholder="ana@correo.com" />
          </Field>
          <Field id="telefono" label="Teléfono (opcional)" error={errors.telefono} hint="10 dígitos">
            <input {...aria('telefono')} type="tel" inputMode="numeric" value={values.telefono} autoComplete="tel" maxLength={14} placeholder="6861234567" />
          </Field>
        </div>

        <div className="two-cols">
          <Field id="nacimiento" label="Fecha de nacimiento" error={errors.nacimiento}>
            <input {...aria('nacimiento')} type="date" value={values.nacimiento} max={today} autoComplete="bday" />
          </Field>
          <Field id="genero" label="Género favorito" error={errors.genero}>
            <select {...aria('genero')} value={values.genero}>
              <option value="">Elige uno…</option>
              {GENRES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field id="password" label="Contraseña" error={errors.password}>
          <div className="pass-row">
            <input
              {...aria('password')}
              type={showPass ? 'text' : 'password'}
              value={values.password}
              autoComplete="new-password"
              maxLength={64}
            />
            <button type="button" className="btn btn-small btn-ghost" onClick={() => setShowPass((s) => !s)} aria-pressed={showPass}>
              {showPass ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <div className="meter" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <i key={n} className={n <= score ? `on s${score}` : ''} />
            ))}
          </div>
          <p className="meter-label" aria-live="polite">
            {values.password ? `Seguridad: ${STRENGTH[score]}` : 'Crea una contraseña segura'}
          </p>
          <ul className="checks">
            {passwordChecks(values.password).map((c) => (
              <li key={c.label} className={c.ok ? 'ok' : ''}>{c.ok ? '✓' : '○'} {c.label}</li>
            ))}
          </ul>
        </Field>

        <Field id="confirm" label="Confirmar contraseña" error={errors.confirm}>
          <input {...aria('confirm')} type={showPass ? 'text' : 'password'} value={values.confirm} autoComplete="new-password" maxLength={64} />
        </Field>

        <div className={'field check' + (errors.terms ? ' has-error' : '')}>
          <label className="checkbox">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={values.terms}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={errors.terms ? 'true' : 'false'}
              aria-describedby="terms-msg"
            />
            <span>Acepto el aviso de privacidad y que esta es una demo escolar.</span>
          </label>
          {errors.terms && <p className="error" id="terms-msg" role="alert">⚠ {errors.terms}</p>}
        </div>

        {formError && <p className="error form-error" role="alert">⚠ {formError}</p>}

        <button className="btn btn-block" type="submit" disabled={busy}>
          {busy ? 'Imprimiendo boleto…' : 'Crear cuenta'}
        </button>
      </form>
    </section>
  );
}
