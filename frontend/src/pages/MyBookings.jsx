import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';
import { badge, heading, spinner, wrap } from '../styles/style';
import StarRating from '../components/StarRating';

const WEEKDAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };

// Local YYYY-MM-DD, matching the backend's dateKey() so skipDates line up.
const dateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const TABS = [
  { key: 'upcomingRides', label: 'Upcoming Rides' },
  { key: 'recurringBookings', label: 'Recurring Bookings' },
  { key: 'completedTrips', label: 'Completed Trips' },
  { key: 'cancelledTrips', label: 'Cancelled Trips' },
];

const HostReview = ({ rideId, driverName, existing, onSaved }) => {
  const { user } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  if (!editing && existing) {
    return (
      <div className="mt-3 pt-3 border-t border-ink/10">
        <div className="flex items-center gap-2">
          <StarRating value={existing.rating} size="w-3.5 h-3.5" />
          <button onClick={() => setEditing(true)} className="text-xs font-bold text-ink/40 hover:text-ink/60 transition-colors">Edit review</button>
        </div>
        {existing.comment && <p className="text-xs text-ink-600 mt-1 italic">"{existing.comment}"</p>}
      </div>
    );
  }

  if (!editing) {
    return (
      <div className="mt-3 pt-3 border-t border-ink/10">
        <button onClick={() => setEditing(true)} className={badge.route}>Rate {driverName}</button>
      </div>
    );
  }

  const submit = async () => {
    if (rating < 1) {
      toast.error('Pick a star rating first.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post('/api/reviews', { rideId, rating, comment }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success(res.data.message || 'Review saved.');
      setEditing(false);
      onSaved(res.data.review);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-ink/10 bg-paper/60 -mx-5 -mb-5 px-5 py-4 rounded-b-2xl">
      <p className="text-xs font-bold text-ink-600 mb-2">How was your ride with {driverName}?</p>
      <StarRating value={rating} onChange={setRating} size="w-6 h-6" />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 300))}
        rows={2}
        maxLength={300}
        placeholder="Leave a comment (optional)"
        className="w-full mt-2 py-2 px-3 bg-white border border-ink/15 rounded-lg text-sm focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all resize-none"
      />
      <div className="flex gap-2 mt-2">
        <button onClick={submit} disabled={submitting} className="bg-ink text-marigold-500 text-xs font-bold px-4 py-2 rounded-lg hover:bg-ink-700 transition-colors disabled:opacity-50">
          {submitting ? 'Saving...' : 'Submit review'}
        </button>
        {existing && (
          <button onClick={() => setEditing(false)} className="text-xs font-bold px-4 py-2 rounded-lg text-ink/50 hover:bg-ink/5 transition-colors">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

const BookingRow = ({ entry, onChanged, reviewable, trackable }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const authHeader = { Authorization: `Bearer ${user.token}` };
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(entry.review || null);
  const { ride, booking } = entry;
  const isRecurring = booking.bookingType === 'recurring';
  const driverPhone = ride.creator?.phoneNumber;
  const driverName = ride.creator?.name || 'Driver';

  const todayKey = dateKey(new Date());
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = dateKey(tomorrow);
  const hostSkippedToday = isRecurring && ride.skipDates?.includes(todayKey);
  const hostSkippedTomorrow = isRecurring && !hostSkippedToday && ride.skipDates?.includes(tomorrowKey);
  const hostPaused = isRecurring && (ride.isPaused || ride.status === 'Paused');

  const call = async (fn, successMsg) => {
    try {
      setBusy(true);
      const res = await fn();
      toast.success(res.data.message || successMsg);
      onChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const cancelToday = () => call(() => api.post(`/api/rides/${ride._id}/cancel`, { scope: 'today' }, { headers: authHeader }), "Today's ride cancelled.");
  const cancelFuture = () => {
    if (!window.confirm('Cancel all future bookings for this recurring ride?')) return;
    call(() => api.post(`/api/rides/${ride._id}/cancel`, { scope: 'all' }, { headers: authHeader }), 'Future bookings cancelled.');
  };
  const cancelSingle = () => {
    if (!window.confirm('Cancel this booking?')) return;
    call(() => api.post(`/api/rides/${ride._id}/cancel`, { scope: 'all' }, { headers: authHeader }), 'Booking cancelled.');
  };
  const pauseBooking = () => call(() => api.patch(`/api/rides/${ride._id}/booking/pause`, {}, { headers: authHeader }), 'Booking paused.');
  const resumeBooking = () => call(() => api.patch(`/api/rides/${ride._id}/booking/resume`, {}, { headers: authHeader }), 'Booking resumed.');

  return (
    <div className="bg-white border border-ink/10 rounded-2xl shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isRecurring ? (
              <span className="text-[11px] font-bold text-route-600 bg-route-50 border border-route-100 px-2.5 py-0.5 rounded-full">🔁 Recurring</span>
            ) : (
              <span className="text-[11px] font-bold text-marigold-600 bg-marigold-500/10 border border-marigold-500/20 px-2.5 py-0.5 rounded-full">📅 One-Time</span>
            )}
            {booking.bookingStatus === 'paused' && <span className="text-[11px] font-bold text-ink/50 bg-ink/5 px-2.5 py-0.5 rounded-full">Paused</span>}
            {booking.bookingStatus === 'cancelled' && <span className="text-[11px] font-bold text-alert-500 bg-alert-50 px-2.5 py-0.5 rounded-full">Cancelled</span>}
          </div>
          <h4 className={heading.card}>{ride.pickupLocation} <span className="text-ink/30 font-normal mx-1">&rarr;</span> {ride.dropoffLocation}</h4>
          <p className={heading.helper}>
            {isRecurring
              ? `Every ${ride.repeatDays?.map(d => WEEKDAY_SHORT[d] || d).join(' • ')} · ${new Date(ride.nextDeparture || ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : new Date(ride.departureTime).toLocaleString()}
            {' '}&middot; ₹{ride.pricePerSeat}
          </p>
          <p className="text-xs text-ink-600 mt-1">Driver: {driverName}</p>
          {hostPaused && (
            <p className="text-xs font-bold text-ink/50 bg-ink/5 inline-block px-2.5 py-1 rounded-lg mt-2">⏸ Host has paused this ride until further notice.</p>
          )}
          {!hostPaused && hostSkippedToday && (
            <p className="text-xs font-bold text-alert-500 bg-alert-50 inline-block px-2.5 py-1 rounded-lg mt-2">🚫 Host cancelled today's ride. Tomorrow continues as scheduled.</p>
          )}
          {!hostPaused && hostSkippedTomorrow && (
            <p className="text-xs font-bold text-alert-500 bg-alert-50 inline-block px-2.5 py-1 rounded-lg mt-2">🚫 Host cancelled tomorrow's ride.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {driverPhone && (
            <a href={`tel:${driverPhone}`} className={badge.route}>Call</a>
          )}
          {ride.creator?._id && (
            <button onClick={() => navigate(`/chat/${ride.creator._id}`, { state: { partnerName: driverName } })} className="text-xs font-bold text-ink bg-ink/5 px-3 py-1.5 rounded-lg hover:bg-ink/10 transition-colors">Message</button>
          )}
          {trackable && (
            <button onClick={() => navigate(`/track-ride/${ride._id}`)} className="text-xs font-bold text-route-600 bg-route-50 px-3 py-1.5 rounded-lg hover:bg-route-100 transition-colors">📍 Track</button>
          )}

          {booking.bookingStatus !== 'cancelled' && (
            isRecurring ? (
              <>
                <button disabled={busy} onClick={cancelToday} className={badge.danger}>Cancel Today's Ride</button>
                <button disabled={busy} onClick={cancelFuture} className={badge.danger}>Cancel Future Bookings</button>
                {booking.bookingStatus === 'paused' ? (
                  <button disabled={busy} onClick={resumeBooking} className={badge.route}>Resume Booking</button>
                ) : (
                  <button disabled={busy} onClick={pauseBooking} className="text-xs font-bold text-ink bg-ink/5 px-3 py-1.5 rounded-lg hover:bg-ink/10 transition-colors">Pause Booking</button>
                )}
              </>
            ) : (
              new Date(ride.departureTime) > new Date() && (
                <button disabled={busy} onClick={cancelSingle} className={badge.danger}>Cancel</button>
              )
            )
          )}
        </div>
      </div>

      {reviewable && ride.creator?._id && (
        <HostReview
          rideId={ride._id}
          driverName={driverName}
          existing={review}
          onSaved={setReview}
        />
      )}
    </div>
  );
};

const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState({ upcomingRides: [], recurringBookings: [], completedTrips: [], cancelledTrips: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcomingRides');

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/api/rides/my-bookings', { headers: { Authorization: `Bearer ${user.token}` } });
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const entries = data[tab] || [];

  return (
    <div className={wrap.page}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className={heading.eyebrowRoute}>Ride Partner</span>
            <h1 className="font-display text-3xl mt-1">My Bookings</h1>
          </div>
          <button onClick={() => navigate('/find-ride')} className="bg-marigold-500 hover:bg-marigold-400 text-ink text-sm font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95">
            + Find a ride
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                tab === t.key ? 'bg-ink text-marigold-500' : 'bg-white border border-ink/10 text-ink-600 hover:border-ink/20'
              }`}
            >
              {t.label} <span className="opacity-60">({data[t.key]?.length || 0})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className={wrap.loadingRow}><div className={spinner}></div></div>
        ) : entries.length === 0 ? (
          <div className="bg-white border border-dashed border-ink/15 rounded-xl p-12 text-center">
            <p className="text-ink-600 font-medium">Nothing here yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <BookingRow
                key={entry.booking._id}
                entry={entry}
                onChanged={fetchBookings}
                reviewable={tab === 'completedTrips' || tab === 'recurringBookings'}
                trackable={
                  entry.booking.bookingStatus !== 'cancelled' &&
                  (tab === 'upcomingRides' || (tab === 'recurringBookings' && entry.ride.occursToday))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
