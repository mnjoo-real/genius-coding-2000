import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const baseNavLinks = [
  { label: 'Home', to: '/' },
  { label: 'My Canopy', to: '/dashboard' },
  { label: 'Recovery', to: '/recovery' },
  { label: 'My Info', to: '/user-info' },
];

function NavLink({ label, to, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={[
        'no-underline text-sm transition-fast',
        active
          ? 'text-forest font-medium border-b-2 border-leaf pb-0.5'
          : 'text-stone-500 hover:text-forest',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}

function NavButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="no-underline text-sm transition-fast text-stone-500 hover:text-forest"
    >
      {label}
    </button>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  const isActive = (to) => pathname === to;

  const navLinks = [
    ...baseNavLinks,
    isAuthenticated
      ? { label: 'Logout', action: 'logout' }
      : { label: 'Login', to: '/login' },
  ];

  async function handleLogout() {
    setOpen(false);

    if (!supabase) {
      navigate('/login');
      return;
    }

    await supabase.auth.signOut();
    setOpen(false);
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-50 bg-parchment border-b border-stone-200">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-14">

        <Link to="/" className="no-underline font-display text-lg text-forest hover:text-forest">
          Canopy
        </Link>

        {/* Desktop */}
        <ul className="hidden sm:flex items-center gap-7 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.label}>
              {'action' in link ? (
                <NavButton label={link.label} onClick={handleLogout} />
              ) : (
                <NavLink {...link} active={isActive(link.to)} />
              )}
            </li>
          ))}
        </ul>

        {/* Hamburger button */}
        <button
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded text-stone-500 hover:text-forest transition-fast"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && !isLoading && (
        <div className="sm:hidden border-t border-stone-200 bg-parchment px-4 py-3 flex flex-col gap-3">
          {navLinks.map((link) => (
            <div key={link.label}>
              {'action' in link ? (
                <NavButton
                  label={link.label}
                  onClick={() => {
                    void handleLogout();
                  }}
                />
              ) : (
                <NavLink
                  {...link}
                  active={isActive(link.to)}
                  onClick={() => setOpen(false)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
