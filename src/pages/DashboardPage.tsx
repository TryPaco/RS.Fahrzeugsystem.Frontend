import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Schneller Einstieg in Kunden, Fahrzeuge und QR-Labels."
      />

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
    </>
  );
}
