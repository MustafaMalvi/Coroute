import HeroSection from '../components/HeroSection';
import WhyChoose from '../components/WhyChoose';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';

const STEPS = [
  {
    mark: 'STEP 1',
    title: 'Create account',
    body: 'Sign up with your @marwadiuniversity.ac.in email in under a minute.',
  },
  {
    mark: 'STEP 2',
    title: 'Choose your role',
    body: 'Join as a Ride Host to publish rides, or a Ride Partner to book open seats.',
  },
  {
    mark: 'STEP 3',
    title: 'Publish or find ride',
    body: 'Hosts post their route and schedule. Partners search and book in seconds.',
  },
  {
    mark: 'STEP 4',
    title: 'Travel together',
    body: 'Meet at the pickup point, split the fare, and reach campus together.',
  },
];

const Home = () => {
  return (
    <div className="flex flex-col flex-1">
      <HeroSection />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="mb-14 max-w-xl">
          <span className="font-meter text-xs tracking-[0.2em] uppercase text-route-500">How it works</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-2">Four stops, one ticket.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/10 rounded-2xl overflow-hidden border border-ink/10">
          {STEPS.map((step, i) => (
            <div key={step.mark} className="relative bg-paper p-8 hover:bg-white transition-colors">
              <span className="font-meter text-xs tracking-widest text-ink/35">{step.mark}</span>
              <h3 className="font-display text-lg mt-4 mb-3">{step.title}</h3>
              <p className="text-ink-600 leading-relaxed text-sm">{step.body}</p>
              {i < STEPS.length - 1 && (
                <svg className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-ink/20 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </section>

      <WhyChoose />
      <Features />
      <Testimonials />
      <FAQ />

      <div className="bg-ink py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-paper/70 font-medium text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-marigold-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            Exclusive to verified Marwadi University students
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
