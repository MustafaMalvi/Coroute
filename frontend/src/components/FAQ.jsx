import { useState } from 'react';

const FAQS = [
  {
    q: 'How do I book a ride?',
    a: 'Go to Find a Ride, search your pickup and dropoff points (and optionally a date or seat count), then tap Book Seat on any open ride. Your seat is confirmed instantly.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes. Open your Dashboard, find the ride under Booking History, and tap Cancel. The seat is released back to the ride immediately.',
  },
  {
    q: 'Who can publish rides?',
    a: 'Only students registered as a Ride Host can publish rides. You choose your role — Ride Host or Ride Partner — when you sign up.',
  },
  {
    q: 'How are users verified?',
    a: 'Every account must sign up with a valid @marwadiuniversity.ac.in email, and an optional GR/Student ID adds an extra layer of verification.',
  },
  {
    q: 'Is CoRoute free to use?',
    a: 'Yes, CoRoute doesn\u2019t charge any platform fee. You only pay the ride host directly for your share of the auto fare.',
  },
];

const FAQItem = ({ faq, isOpen, onClick }) => (
  <div className="border-b border-ink/10">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-5 text-left gap-4"
      aria-expanded={isOpen}
    >
      <span className="font-display text-base">{faq.q}</span>
      <svg className={`w-5 h-5 flex-shrink-0 text-ink/40 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`} style={{ display: 'grid' }}>
      <div className="overflow-hidden">
        <p className="text-ink-600 text-sm leading-relaxed pr-8">{faq.a}</p>
      </div>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
      <div className="mb-10 text-center">
        <span className="font-meter text-xs tracking-[0.2em] uppercase text-route-500">FAQ</span>
        <h2 className="font-display text-3xl sm:text-4xl mt-2">Common questions.</h2>
      </div>

      <div className="bg-white border border-ink/10 rounded-2xl px-6">
        {FAQS.map((faq, i) => (
          <FAQItem key={faq.q} faq={faq} isOpen={openIndex === i} onClick={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </section>
  );
};

export default FAQ;
