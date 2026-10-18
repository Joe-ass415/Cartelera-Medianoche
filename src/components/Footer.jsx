export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-row">
        <p>
          © {new Date().getFullYear()} Cineclub Medianoche · Proyecto escolar, Unidad 3.
        </p>
        <p className="tmdb">
          Datos de películas por TMDB. Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.
        </p>
      </div>
    </footer>
  );
}
