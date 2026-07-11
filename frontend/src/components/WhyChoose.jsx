const REASONS = [
  {
    title: 'Safe ride sharing',
    body: 'Every account is a verified @marwadiuniversity.ac.in student — no strangers, no guesswork.',
    icon: 'M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z',
  },
  {
    title: 'Affordable travel',
    body: 'Split the auto fare with co-passengers. The more seats filled, the less everyone pays.',
    icon: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  },
  {
    title: 'Student verified users',
    body: 'Signups are gated by GR number and university email, so you always know who you\u2019re riding with.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Easy booking',
    body: 'Search, tap, done. Book a seat in three taps — no back-and-forth negotiation.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    title: 'Real-time availability',
    body: 'Seat counts and ride status update live, so you never book a ride that\u2019s already full.',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

const WhyChoose = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
    <div className="mb-12 max-w-xl">
      <span className="font-meter text-xs tracking-[0.2em] uppercase text-route-500">Why CoRoute</span>
      <h2 className="font-display text-3xl sm:text-4xl mt-2">Built for how students actually commute.</h2>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {REASONS.map((r) => (
        <div key={r.title} className="bg-white border border-ink/10 rounded-2xl p-6 hover:shadow-ticket hover:-translate-y-1 transition-all duration-300">
          <div className="w-11 h-11 rounded-xl bg-marigold-500/10 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-marigold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={r.icon} />
            </svg>
          </div>
          <h3 className="font-display text-base mb-2">{r.title}</h3>
          <p className="text-ink-600 text-sm leading-relaxed">{r.body}</p>
        </div>
      ))}
    </div>
  </section>
);

export default WhyChoose;
