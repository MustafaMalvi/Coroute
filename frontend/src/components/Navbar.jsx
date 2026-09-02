import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useMessageNotifications } from '../context/MessageNotificationsContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useMessageNotifications();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/find-ride', label: 'Find a Ride' },
    ...(!user || user.role === 'host' ? [{ to: '/offer-ride', label: 'Offer a Ride' }] : []),
    ...(user?.role === 'host' ? [{ to: '/my-rides', label: 'My Rides' }] : []),
    ...(user?.role === 'partner' ? [{ to: '/my-bookings', label: 'My Bookings' }] : []),
    { to: '/track-ride', label: 'Track Ride' },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-ink border-b-[3px] border-marigold-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-marigold-500 text-ink font-display text-sm">
              CR
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-ink"></span>
            </span>
            <span className="font-display text-lg text-paper tracking-tight">
              Co<span className="text-marigold-500">Route</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-semibold uppercase tracking-wide transition-colors border-b-2 pb-1 ${
                  isActive(l.to) ? 'text-marigold-500 border-marigold-500' : 'text-paper/70 border-transparent hover:text-paper'
                }`}
              >
                {l.label}
              </Link>
            ))}

            <div className="h-6 w-px bg-paper/15"></div>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-paper/10 text-marigold-400">
                  {user.role === 'host' ? 'Host' : 'Partner'}
                </span>
                <Link to="/inbox" aria-label="Messages" className="relative text-paper/70 hover:text-marigold-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-alert-400 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-paper/10 hover:bg-paper/20 transition-colors">
                  <span className="w-7 h-7 rounded-full bg-marigold-500 text-ink font-display text-xs flex items-center justify-center">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                  <span className="text-sm font-semibold text-paper">{user.name}</span>
                </Link>
                <button onClick={logout} className="text-sm font-semibold text-paper/60 hover:text-alert-400 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-paper/80 hover:text-paper transition-colors">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-bold bg-marigold-500 text-ink px-5 py-2 rounded-full hover:bg-marigold-400 active:scale-95 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden text-paper p-2 -mr-2"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-ink border-t border-paper/10 px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wide ${
                isActive(l.to) ? 'bg-marigold-500/10 text-marigold-500' : 'text-paper/80 hover:bg-paper/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="h-px bg-paper/10 my-2"></div>
          {user ? (
            <div className="space-y-1">
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-paper/5">
                <span className="w-8 h-8 rounded-full bg-marigold-500 text-ink font-display text-xs flex items-center justify-center">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
                <span className="text-sm font-semibold text-paper">{user.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-paper/10 text-marigold-400 ml-auto">
                  {user.role === 'host' ? 'Host' : 'Partner'}
                </span>
              </Link>
              <Link to="/inbox" onClick={() => setOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-paper/80 hover:bg-paper/5">
                Messages
                {unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-alert-400 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-alert-400 hover:bg-alert-400/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link to="/login" onClick={() => setOpen(false)} className="text-center py-2.5 rounded-lg border border-paper/20 text-paper font-semibold text-sm">
                Log in
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="text-center py-2.5 rounded-lg bg-marigold-500 text-ink font-bold text-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
