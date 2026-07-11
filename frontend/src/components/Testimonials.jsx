const TESTIMONIALS = [
  {
    name: 'Priya S.',
    role: 'Ride Partner · CSE, 3rd year',
    quote: 'I used to spend ₹80 on an auto every morning. Now I split it three ways and I\u2019ve made two new friends on my route.',
  },
  {
    name: 'Rahul P.',
    role: 'Ride Host · Mechanical, 4th year',
    quote: 'My auto used to run half-empty every evening. CoRoute fills the seats before I even leave the hostel gate.',
  },
  {
    name: 'Aisha K.',
    role: 'Ride Partner · MBA, 1st year',
    quote: 'The women-only ride option made me comfortable booking my very first ride. Verified students only — that matters.',
  },
  {
    name: 'Devansh M.',
    role: 'Ride Host · Civil, 2nd year',
    quote: 'Publishing a ride takes less time than waiting for a rickshaw at the stand. Booking requests come in within minutes.',
  },
  {
    name: 'Simran T.',
    role: 'Ride Partner · IT, 3rd year',
    quote: 'Live tracking means my roommate always knows exactly where I am on the way back from campus. Huge peace of mind.',
  },
];

const Testimonials = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
    <div className="mb-12 max-w-xl">
      <span className="font-meter text-xs tracking-[0.2em] uppercase text-route-500">Testimonials</span>
      <h2 className="font-display text-3xl sm:text-4xl mt-2">What students are saying.</h2>
    </div>

    <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
      {TESTIMONIALS.map((t) => (
        <div key={t.name} className="ride-ticket bg-white border border-ink/10 rounded-2xl p-6 flex-shrink-0 w-80 snap-start" style={{ '--notch-color': '#FBF6EA' }}>
          <div className="flex text-marigold-500 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.062 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
              </svg>
            ))}
          </div>
          <p className="text-ink-600 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
          <div className="ride-ticket-perforation pt-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-marigold-500/15 text-marigold-600 font-display text-sm flex items-center justify-center flex-shrink-0">
              {t.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm text-ink">{t.name}</p>
              <p className="text-xs text-ink/40">{t.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials;
