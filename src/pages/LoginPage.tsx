import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin123!');
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
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand-logo large">RS</div>
        <h1>RS Fahrzeugsystem</h1>
        <p>Werkstattverwaltung für Fahrzeuge, Kunden und QR-Labels.</p>

        <label>
          Benutzername
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <label>
          Passwort
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error ? <div className="error-box">{error}</div> : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Anmeldung läuft…' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
