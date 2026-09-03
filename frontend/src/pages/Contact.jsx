import { heading, wrap } from '../styles/style';

// Change this to whatever inbox should receive support mail.
const SUPPORT_EMAIL = 'coroute.help@gmail.com';
const SUBJECT = 'CoRoute Support Request';

const gmailComposeUrl = () => {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: SUPPORT_EMAIL,
    su: SUBJECT,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
};

const Contact = () => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="livery-bg relative overflow-hidden">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <span className="inline-block text-marigold-500 font-meter text-xs tracking-[0.2em] uppercase mb-5 border border-marigold-500/40 rounded-full px-3 py-1">
            Contact
          </span>
          <h1 className="font-display text-paper text-4xl sm:text-5xl leading-[1.05] mb-6">
            Got a question?
            <br />
            <span className="text-marigold-500">Just email us.</span>
          </h1>
          <p className="text-paper/70 text-lg max-w-md mx-auto">
            Bugs, feature ideas, account issues — one button, straight to our inbox.
          </p>
        </div>
      </div>

      <section className={wrap.section}>
        <div className="max-w-lg mx-auto">
          <div className="ride-ticket bg-paper rounded-2xl shadow-ticket p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-route-50 text-route-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className={heading.card}>Reach the CoRoute team</h2>
            <p className="text-ink-600 text-sm mt-2 mb-7 leading-relaxed">
              Tap the button below to open a pre-filled email in Gmail. We read every message
              and get back to you as soon as we can.
            </p>
            <a
              href={gmailComposeUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full bg-marigold-500 text-ink font-bold hover:bg-marigold-400 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.909 1.528-1.146C21.69 2.28 24 3.434 24 5.457z" />
              </svg>
              Email us on Gmail
            </a>
            <p className="text-ink-600/60 text-xs mt-5 font-meter">
              {SUPPORT_EMAIL}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;