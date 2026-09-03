import { heading, wrap } from '../styles/style';

const SECTIONS = [
  {
    title: '1. Who can use CoRoute',
    body: `CoRoute is built for students of Marwadi University. You must register with a
valid university email and keep your account details accurate. You're responsible for
anything posted or booked from your account.`,
  },
  {
    title: '2. Ride Hosts and Ride Partners',
    body: `A Ride Host publishes a ride — one-time or recurring — with a route, schedule,
seats, and price per seat. A Ride Partner searches and books an available seat.
CoRoute only provides the platform to connect the two; we are not a transport operator
and are not a party to any ride arrangement made between a host and a partner.`,
  },
  {
    title: '3. Fares and payments',
    body: `Any fare shown on CoRoute is a per-seat contribution agreed between the host and
partner to split travel costs, not a fare charged by CoRoute. Payment happens directly
between host and partner; CoRoute does not process or hold any payment.`,
  },
  {
    title: '4. Cancellations and no-shows',
    body: `Hosts can pause, reschedule, or cancel a ride or a specific occurrence; partners
can cancel a booking. Both sides get notified through in-app chat when this happens.
Repeated no-shows or last-minute cancellations may affect a host's rating or a
partner's ability to book.`,
  },
  {
    title: '5. Conduct',
    body: `Be honest about seats, timing, and route. No harassment, discrimination, or
unsafe driving. Hosts publishing a "Women Only" ride must honour that restriction.
Accounts found violating this may be suspended.`,
  },
  {
    title: '6. Live location and safety',
    body: `Live location sharing during an active ride is provided to help hosts and
partners find each other and to add a layer of safety. Sharing your ride details with
someone you trust is still a good idea — CoRoute doesn't guarantee ride safety and
isn't liable for incidents that happen during a ride.`,
  },
  {
    title: '7. Reviews',
    body: `Reviews may only be left by a partner who has actually booked a ride with that
host. Reviews should be honest and relevant to the ride experience; we may remove
reviews that are abusive, fake, or unrelated.`,
  },
  {
    title: '8. Limitation of liability',
    body: `CoRoute is provided "as is," as a student project connecting riders on one
campus. We do our best to keep the platform reliable and accurate, but we don't
guarantee uninterrupted availability and aren't liable for losses arising from rides
arranged through the platform.`,
  },
  {
    title: '9. Changes to these terms',
    body: `We may update these terms as CoRoute evolves. Continued use after an update
means you accept the revised terms.`,
  },
];

const Terms = () => {
  return (
    <div className={wrap.page}>
      <div className="max-w-3xl mx-auto">
        <span className={heading.eyebrowRoute}>Legal</span>
        <h1 className={heading.page}>Terms of Service</h1>
        <p className="text-ink-600 text-sm mt-2 mb-10 font-meter">Last updated: September 2026</p>

        <p className="text-ink-600 leading-relaxed mb-10">
          By creating an account or using CoRoute, you agree to the terms below. Please
          read them before posting or booking a ride.
        </p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-lg mb-2">{s.title}</h2>
              <p className="text-ink-600 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Terms;