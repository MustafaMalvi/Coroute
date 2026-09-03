import { heading, wrap } from '../styles/style';

const SECTIONS = [
  {
    title: '1. What we collect',
    body: `We collect the information you give us directly: your name, university email,
student/GR number, phone number, gender, college, and vehicle details if you register
as a Ride Host. When you use CoRoute we also store the rides you post or book, the
messages you send through in-app chat, reviews you leave for hosts, and — only while a
ride is active and you choose to share it — your live GPS location.`,
  },
  {
    title: '2. How we use it',
    body: `Your information is used to run the core features of CoRoute: verifying you're a
Marwadi University student, matching Ride Hosts with Ride Partners, showing live
location during an active ride so both sides can find each other, sending in-app
notifications about bookings, cancellations, and messages, and keeping host ratings
accurate.`,
  },
  {
    title: '3. Who can see what',
    body: `Your name, vehicle details (for hosts), and rating are visible to other students
when you post or book a ride. Your phone number is only shared with a Ride Partner who
books your ride, or with the host once you book their ride. Live location is only
visible to the host and partner on that specific ride, and only for its duration. We do
not sell or rent your data to anyone.`,
  },
  {
    title: '4. Live location sharing',
    body: `Location sharing is tied to a specific ride and turns off automatically once
that ride ends. We don't track your location outside of an active ride, and you can
stop sharing at any time from the tracking screen.`,
  },
  {
    title: '5. Data retention',
    body: `We keep your account, ride, and booking history for as long as your account is
active, so you can look back at past trips and reviews. If you delete your account, we
remove your personal profile information; anonymised ride records may be retained for
basic platform statistics.`,
  },
  {
    title: '6. Your choices',
    body: `You can update your profile, vehicle details, and password at any time from
your Profile page. You can delete a ride, cancel a booking, or stop sharing your
location whenever you choose. To request account deletion, reach out from the Contact
page.`,
  },
  {
    title: '7. Changes to this policy',
    body: `If this policy changes, we'll update this page and adjust the "last updated"
date below. Continued use of CoRoute after an update means you accept the revised
policy.`,
  },
];

const Privacy = () => {
  return (
    <div className={wrap.page}>
      <div className="max-w-3xl mx-auto">
        <span className={heading.eyebrowRoute}>Legal</span>
        <h1 className={heading.page}>Privacy Policy</h1>
        <p className="text-ink-600 text-sm mt-2 mb-10 font-meter">Last updated: September 2026</p>

        <p className="text-ink-600 leading-relaxed mb-10">
          CoRoute is a carpooling platform built for Marwadi University students. This
          page explains what information we collect, how it's used, and who can see it.
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

export default Privacy;