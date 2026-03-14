import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-logo">RS</div>
          <div>
            <strong>RS Fahrzeugsystem</strong>
            <p>RS-Engineers / BTuning</p>
          </div>
        </div>

        <nav className="nav-links">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/customers">Kunden</NavLink>
          <NavLink to="/vehicles">Fahrzeuge</NavLink>
          <NavLink to="/labels">Labels</NavLink>
        </nav>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div>
            <strong>{user?.displayName ?? 'Benutzer'}</strong>
            <span>{user?.username}</span>
          </div>
          <button className="ghost-button" onClick={handleLogout}>Abmelden</button>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
