import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  Product: [
    { label: 'Find a Ride', to: '/find-ride' },
    { label: 'Offer a Ride', to: '/offer-ride' },
    { label: 'Track a Ride', to: '/track-ride' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};

const Footer = () => (
  <footer className="bg-ink border-t border-paper/10 mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-marigold-500 text-ink font-display text-[10px] flex items-center justify-center">CR</span>
            <span className="font-display text-sm text-paper tracking-tight">CoRoute</span>
          </div>
          <p className="text-paper/40 text-xs mt-3 leading-relaxed max-w-[16rem]">
            The campus carpool network for Marwadi University students.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="GitHub" className="w-8 h-8 rounded-full bg-paper/5 flex items-center justify-center text-paper/50 hover:text-marigold-500 hover:bg-paper/10 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.1.68-.22.68-.5 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.36-3.37-1.36-.46-1.19-1.11-1.51-1.11-1.51-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.55 2.34 1.1 2.91.84.09-.66.35-1.1.63-1.36-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.29 9.29 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.78-4.57 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.5A10.03 10.03 0 0022 12.26C22 6.58 17.52 2 12 2z" /></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-paper/5 flex items-center justify-center text-paper/50 hover:text-marigold-500 hover:bg-paper/10 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45z" /></svg>
            </a>
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section}>
            <h4 className="text-paper text-xs font-bold uppercase tracking-wide mb-4">{section}</h4>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="text-paper/50 text-sm hover:text-marigold-500 transition-colors">{l.label}</Link>
                  ) : (
                    <a href={l.href} className="text-paper/50 text-sm hover:text-marigold-500 transition-colors">{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-paper/10 text-center">
        <p className="text-paper/40 text-xs">
          Built for Marwadi University students, by students. &copy; 2026 CoRoute.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
