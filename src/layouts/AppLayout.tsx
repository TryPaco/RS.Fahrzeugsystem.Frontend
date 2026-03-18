import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AppLayout() {
  const { logout, user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const isSuperadmin = user?.roles.includes('Superadmin') ?? false;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <img className="brand-logo brand-logo-image" src="/logo.png" alt="RS Engineers Logo" />
          <div>
            <strong>Fahrzeugsystem</strong>
            <p>RS-Engineers / B-Tuning</p>
          </div>
        </div>

        <nav className="nav-links">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/customers">Kunden</NavLink>
          <NavLink to="/vehicles">Fahrzeuge</NavLink>
          <NavLink to="/labels">Labels</NavLink>
          {hasPermission('vehiclecatalog.manage') ? <NavLink to="/vehicle-catalog">Fahrzeugkatalog</NavLink> : null}
          {hasPermission('users.view') ? <NavLink to="/users">Benutzer</NavLink> : null}
          {isSuperadmin ? <NavLink to="/settings/smtp">E-Mail</NavLink> : null}
        </nav>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div>
            <strong>{user?.displayName ?? 'Benutzer'}</strong>
            <span>{user?.username}</span>
          </div>
          <div className="actions">
            <button className="ghost-button" onClick={() => navigate('/change-password')}>
              Passwort ändern
            </button>
            <button className="ghost-button" onClick={handleLogout}>Abmelden</button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <NavLink to="/">Start</NavLink>
        <NavLink to="/customers">Kunden</NavLink>
        <NavLink to="/vehicles">Fahrzeuge</NavLink>
        <NavLink to="/labels">Labels</NavLink>
      </nav>
    </div>
  );
}
