import { Link } from 'react-router-dom';
import { heading, wrap } from '../styles/style';

const STATS = [
  { value: '3', label: 'Team builders' },
  { value: '2', label: 'Ride roles — Host & Partner' },
  { value: '154', label: 'Automated tests, all passing' },
  { value: '24/7', label: 'Live ride tracking' },
];

const VALUES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-3a4 4 0 100-8 4 4 0 000 8zm6 3a4 4 0 10-8 0" />
      </svg>
    ),
    title: 'Built for campus, not commuters at large',
    body: "CoRoute isn't trying to be a city-wide ride app. It's scoped tight to one university, so every rider on it is already someone from your own campus.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'A record, not a group chat',
    body: 'No more scrolling through fifty messages to figure out if a seat is taken. Every ride, booking, and cancellation lives in one clean, checkable place.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Built for the way students actually travel',
    body: "One-off trips home for the weekend and the same 8 AM ride every weekday — CoRoute treats both as first-class, not an afterthought bolted onto a one-time booking form.",
  },
];

const About = () => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <div className="livery-bg relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <span className="inline-block text-marigold-500 font-meter text-xs tracking-[0.2em] uppercase mb-5 border border-marigold-500/40 rounded-full px-3 py-1">
            About CoRoute
          </span>
          <h1 className="font-display text-paper text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">
            One campus.
            <br />
            <span className="text-marigold-500">One seat at a time.</span>
          </h1>
          <p className="text-paper/70 text-lg max-w-xl mx-auto">
            CoRoute is the carpool network built for Marwadi University students — post a
            route, book an open seat, and skip the group-chat guesswork.
          </p>
        </div>
      </div>

      {/* Origin story, told as a ticket */}
      <section className={wrap.section}>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className={heading.eyebrowRoute}>Why we built this</span>
            <h2 className={heading.page}>Group chats weren't cutting it.</h2>
            <p className="text-ink-600 mt-5 leading-relaxed">
              Getting around campus, home for the weekend, or back after a holiday usually
              meant the same routine: post in a chat group, wait for replies, hope the seat
              is still open by the time someone answers. Messages get buried, plans change,
              and nobody has a clean record of who actually confirmed.
            </p>
            <p className="text-ink-600 mt-4 leading-relaxed">
              CoRoute keeps the part of that habit that works — asking around is quick — and
              fixes the part that doesn't. A Ride Host posts a route once. A Ride Partner
              finds it, books a seat, and both sides can check the same booking later without
              scrolling through old messages.
            </p>
            <Link
              to="/find-ride"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-marigold-500 text-ink font-bold hover:bg-marigold-400 active:scale-95 transition-all"
            >
              Find a ride
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="ride-ticket bg-paper rounded-2xl shadow-ticket p-6 rotate-[2deg] hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="font-meter text-[11px] tracking-widest text-ink/40 uppercase">
                  Boarding pass &middot; About
                </span>
                <span className="text-route-600 bg-route-50 border border-route-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Est. Marwadi University
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-meter text-[10px] text-ink/40 uppercase tracking-widest">From</p>
                  <p className="font-display text-lg leading-tight">GROUP CHAT</p>
                </div>
                <svg className="w-6 h-6 text-ink/25 mx-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="text-right">
                  <p className="font-meter text-[10px] text-ink/40 uppercase tracking-widest">To</p>
                  <p className="font-display text-lg leading-tight">CoRoute</p>
                </div>
              </div>
              <div className="ride-ticket-perforation mt-5 pt-5">
                <p className="font-meter text-xs text-ink/50 leading-relaxed">
                  One route. One booking. One place to check it — built by three MCA students
                  who got tired of asking "is the seat still free?" twice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-ink py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl sm:text-4xl text-marigold-500">{s.value}</p>
              <p className="text-paper/60 text-xs sm:text-sm mt-2 font-meter uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What we care about */}
      <section className={wrap.section}>
        <div className="mb-14 max-w-xl">
          <span className={heading.eyebrowRoute}>What matters to us</span>
          <h2 className={heading.page}>Small scope, real use.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-white rounded-2xl border border-ink/10 p-7">
              <div className="w-10 h-10 rounded-xl bg-route-50 text-route-600 flex items-center justify-center mb-5">
                {v.icon}
              </div>
              <h3 className="font-display text-lg mb-2">{v.title}</h3>
              <p className="text-ink-600 text-sm leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <div className="bg-ink py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-paper mb-4">
            Ready to skip the group chat?
          </h2>
          <p className="text-paper/60 mb-8">
            Sign up with your Marwadi University email and book — or post — your next ride.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-marigold-500 text-ink font-bold hover:bg-marigold-400 active:scale-95 transition-all"
            >
              Create an account
            </Link>
            <Link
              to="/find-ride"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border-2 border-paper/25 text-paper font-bold hover:border-paper/60 transition-all"
            >
              Browse rides first
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;