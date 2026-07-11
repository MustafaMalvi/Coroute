import { Link } from 'react-router-dom';

const HeroSection = () => (
  <div className="livery-bg relative overflow-hidden">
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="inline-block text-marigold-500 font-meter text-xs tracking-[0.2em] uppercase mb-5 border border-marigold-500/40 rounded-full px-3 py-1">
            Marwadi University &middot; Rajkot
          </span>
          <h1 className="font-display text-paper text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">
            Share the ride
            <br />
            <span className="text-marigold-500">to campus.</span>
          </h1>
          <p className="text-paper/70 text-lg max-w-md mb-10">
            Post your route or grab an open seat. Split the auto fare with students already headed your way — every rider, GR-number verified.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/find-ride"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-marigold-500 text-ink font-bold hover:bg-marigold-400 active:scale-95 transition-all"
            >
              Find a Ride
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              to="/offer-ride"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border-2 border-paper/25 text-paper font-bold hover:border-paper/60 transition-all"
            >
              Offer a Ride
            </Link>
          </div>
        </div>

        {/* Signature: a literal ride ticket, the app's core unit */}
        <div className="relative mx-auto w-full max-w-sm">
          <div
            className="ride-ticket bg-paper rounded-2xl shadow-ticket p-6 rotate-[-3deg] hover:rotate-0 transition-transform duration-300"
            style={{ '--notch-color': '#16171A' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-meter text-[11px] tracking-widest text-ink/40 uppercase">Boarding pass · #A17</span>
              <span className="text-rose-500 bg-rose-50 border border-rose-100 text-[10px] font-bold px-2 py-0.5 rounded-full">🚺 Women Only</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-meter text-[10px] text-ink/40 uppercase tracking-widest">From</p>
                <p className="font-display text-lg leading-tight">KKV HALL</p>
              </div>
              <svg className="w-6 h-6 text-ink/25 mx-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              <div className="text-right">
                <p className="font-meter text-[10px] text-ink/40 uppercase tracking-widest">To</p>
                <p className="font-display text-lg leading-tight">MU HOSTEL</p>
              </div>
            </div>
            <div className="ride-ticket-perforation mt-5 pt-5 flex items-center justify-between">
              <div className="text-sm text-ink/60">
                <p className="font-semibold text-ink">7:45 AM &middot; 2 seats left</p>
                <p className="text-xs mt-0.5">Driven by R. Patel</p>
              </div>
              <div className="meter-chip px-3 py-1.5 text-base font-semibold">₹35</div>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 w-full h-full rounded-2xl border-2 border-marigold-500/30 -z-10"></div>
        </div>
      </div>
    </div>
  </div>
);

export default HeroSection;
