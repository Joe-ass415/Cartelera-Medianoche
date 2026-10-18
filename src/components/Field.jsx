// Campo de formulario accesible: etiqueta, input y mensaje de error enlazados con aria.
export default function Field({ id, label, error, hint, children }) {
  return (
    <div className={'field' + (error ? ' has-error' : '')}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="hint" id={`${id}-msg`}>{hint}</p>}
      {error && (
        <p className="error" id={`${id}-msg`} role="alert">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
