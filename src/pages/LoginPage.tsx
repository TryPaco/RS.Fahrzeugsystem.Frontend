import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Login fehlgeschlagen. Bitte Zugangsdaten prüfen.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-hero">
          <img
            className="brand-logo-image brand-logo-large-image"
            src="/logo.png"
            alt="RS Engineers Logo"
          />
          <span className="eyebrow">RS-Engineers / B-Tuning</span>
          <h1>Fahrzeugsystem für Werkstatt und Performance</h1>
          <p>
            Kunden, Fahrzeuge, Historie und Labels an einem Ort. Schnell für den Alltag,
            sauber für Wachstum und Administration.
          </p>

          <div className="auth-hero-points">
            <div className="auth-hero-point">
              <strong>Zentral</strong>
              <span>Alle Fahrzeug- und Kundendaten übersichtlich gebündelt.</span>
            </div>
            <div className="auth-hero-point">
              <strong>Werkstattnah</strong>
              <span>VIN, Umbauten, Historie und Label-Zuordnung direkt im Zugriff.</span>
            </div>
            <div className="auth-hero-point">
              <strong>Sicher</strong>
              <span>Benutzer, Rollen und Admin-Bereiche sauber voneinander getrennt.</span>
            </div>
          </div>
        </section>

        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="eyebrow">Anmeldung</span>
          <h2 className="auth-card-title">Willkommen zurück</h2>
          <p>Melde dich an, um mit Kunden, Fahrzeugen und Labels weiterzuarbeiten.</p>

          <label className="field">
            <span>Benutzername</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Passwort</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error ? <div className="error-box">{error}</div> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Anmeldung laeuft...' : 'Anmelden'}
          </button>

          <Link className="auth-link" to="/forgot-password">
            Passwort vergessen?
          </Link>
        </form>
      </div>
    </div>
  );
}
