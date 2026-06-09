import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Home',      to: '/' },
  { label: 'My Score',  to: '/dashboard' },
  { label: 'Recovery',  to: '/recovery' },
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

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (to) => pathname === to;

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
              <NavLink {...link} active={isActive(link.to)} />
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
      {open && (
        <div className="sm:hidden border-t border-stone-200 bg-parchment px-4 py-3 flex flex-col gap-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              {...link}
              active={isActive(link.to)}
              onClick={() => setOpen(false)}
            />
          ))}
        </div>
      )}
    </nav>
  );
}
