import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';

export function DashboardPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        subtitle="Schneller Einstieg in Kunden, Fahrzeuge und QR-Labels."
      />

      <section className="dashboard-hero card">
        <div>
          <span className="eyebrow">Werkstatt-Cockpit</span>
          <h2>Alles Wichtige direkt im Zugriff</h2>
          <p>
            Springe ohne Umwege in die tägliche Arbeit: Kunden erfassen, Fahrzeuge pflegen
            und Labels verwalten. Das Dashboard ist bewusst klar gehalten, damit dein Team
            sofort loslegen kann.
          </p>
        </div>
        <div className="dashboard-hero-grid">
          <div>
            <strong>Kunden</strong>
            <span>Kontakte, Firmendaten und Nummernkreise sauber organisiert.</span>
          </div>
          <div>
            <strong>Fahrzeuge</strong>
            <span>Von FIN über Leistung bis Historie in einer zentralen Struktur.</span>
          </div>
          <div>
            <strong>Labels</strong>
            <span>Freie Codes und Zuweisungen jederzeit nachvollziehbar.</span>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <Link to="/customers" className="card stat-card">
          <h3>Kunden</h3>
          <p>Kunden verwalten und neue Datensätze anlegen.</p>
        </Link>
        <Link to="/vehicles" className="card stat-card">
          <h3>Fahrzeuge</h3>
          <p>Fahrzeuge mit FIN, KM-Stand und Umbauten verwalten.</p>
        </Link>
        <Link to="/labels" className="card stat-card">
          <h3>Labels</h3>
          <p>RS- und B-QR-Codes nachschlagen und zuweisen.</p>
        </Link>
      </div>

      <div className="dashboard-strip">
        <div className="card dashboard-note">
          <strong>Sauberer Workflow</strong>
          <p>Die wichtigsten Bereiche bleiben bewusst kompakt, damit neue Mitarbeiter schnell zurechtkommen.</p>
        </div>
        <div className="card dashboard-note">
          <strong>Admin bereit</strong>
          <p>Benutzer, Rollen, SMTP und Passwort-Reset sind bereits vorbereitet und integriert.</p>
        </div>
      </div>
    </div>
  );
}
