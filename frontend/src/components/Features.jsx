import CounterStat from './CounterStat';

const FEATURES = [
  { title: 'Ride Matching', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4' },
  { title: 'Verified Users', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { title: 'Secure Login', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { title: 'Quick Booking', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { title: 'Flexible Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { title: 'Easy Route Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { title: 'Live Availability', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const STATS = [
  { value: 850, suffix: '+', label: 'Rides matched' },
  { value: 1200, suffix: '+', label: 'Verified students' },
  { value: 60, suffix: '+', label: 'Campus routes' },
  { value: 4.8, suffix: '/5', label: 'Average rating', decimals: 1 },
];

const Features = () => (
  <>
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      <div className="mb-12 max-w-xl">
        <span className="font-meter text-xs tracking-[0.2em] uppercase text-route-500">Features</span>
        <h2 className="font-display text-3xl sm:text-4xl mt-2">Everything you need, nothing you don&apos;t.</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-paper border border-ink/10 rounded-2xl p-5 hover:bg-white hover:shadow-sm transition-all">
            <svg className="w-6 h-6 text-route-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={f.icon} />
            </svg>
            <p className="font-bold text-sm text-ink">{f.title}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="livery-bg py-16 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
        {STATS.map((s) => (
          <CounterStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} decimals={s.decimals || 0} />
        ))}
      </div>
    </section>
  </>
);

export default Features;
