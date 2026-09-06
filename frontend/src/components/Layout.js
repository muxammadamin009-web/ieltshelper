import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Mark = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 5.5C5.5 4.3 8 4 12 5.5C16 4 18.5 4.3 21 5.5V18C18.5 16.8 16 16.5 12 18C8 16.5 5.5 16.8 3 18V5.5Z"
      className="stroke-teal"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M12 5.5V18" className="stroke-teal" strokeWidth="1.6" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/study', label: 'Study' },
  { to: '/writing', label: 'Writing' },
  { to: '/translator', label: 'Translator' },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-panel">
      <header className="border-b border-line bg-paper sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <span className="transition-transform duration-200 ease-smooth group-hover:rotate-6 group-hover:scale-110 inline-flex">
              <Mark />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight">
              Bandwell
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {user &&
              NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="text-ink/70 hover:text-teal link-underline transition-colors">
                  {l.label}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-line text-ink/70 hover:text-teal hover:border-teal transition-colors"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <div className="hidden sm:flex items-center gap-3 text-sm">
                <Link to="/profile" className="text-ink/70 hover:text-teal link-underline transition-colors">
                  {user.name}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-ink/70 hover:text-teal link-underline transition-colors">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-secondary py-1.5">
                  Log out
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3 text-sm">
                <Link to="/login" className="text-ink/70 hover:text-teal link-underline transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary py-1.5">
                  Get started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMenuOpen((m) => !m)}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-md border border-line"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden border-t border-line px-6 py-4 space-y-3 text-sm bg-paper">
            {user ? (
              <>
                {NAV_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className="block text-ink/70" onClick={() => setMenuOpen(false)}>
                    {l.label}
                  </Link>
                ))}
                <Link to="/profile" className="block text-ink/70" onClick={() => setMenuOpen(false)}>
                  Profile ({user.name})
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block text-ink/70" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-secondary w-full">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-ink/70" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary w-full block text-center" onClick={() => setMenuOpen(false)}>
                  Get started
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 animate-fade-in">{children}</main>

      <footer className="border-t border-line bg-paper">
        <div className="max-w-5xl mx-auto px-6 py-10 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <Mark />
              <span className="font-serif font-semibold">Bandwell</span>
            </div>
            <p className="text-xs text-ink/50 mt-2 max-w-[220px]">
              Reading and listening practice for people getting ready to sit the IELTS.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-ink/40 mb-2">Practice</p>
            <ul className="space-y-1.5 text-sm text-ink/70">
              <li><Link to="/dashboard" className="hover:text-teal">Mock tests</Link></li>
              <li><Link to="/study" className="hover:text-teal">Vocabulary &amp; grammar</Link></li>
              <li><Link to="/writing" className="hover:text-teal">Writing</Link></li>
              <li><Link to="/translator" className="hover:text-teal">Translator</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-ink/40 mb-2">Account</p>
            <ul className="space-y-1.5 text-sm text-ink/70">
              <li><Link to="/profile" className="hover:text-teal">Profile</Link></li>
              <li><Link to="/#pricing" className="hover:text-teal">Pricing</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-4">
          <p className="max-w-5xl mx-auto px-6 text-xs text-ink/40">
            © {new Date().getFullYear()} Bandwell.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
