import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';

const WEEKDAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };
const TABS = [
  { key: 'upcomingRides', label: 'Upcoming Rides' },
  { key: 'recurringBookings', label: 'Recurring Bookings' },
  { key: 'completedTrips', label: 'Completed Trips' },
  { key: 'cancelledTrips', label: 'Cancelled Trips' },
];

const BookingRow = ({ entry, onChanged }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const authHeader = { Authorization: `Bearer ${user.token}` };
  const [busy, setBusy] = useState(false);
  const { ride, booking } = entry;
  const isRecurring = booking.bookingType === 'recurring';
  const driverPhone = ride.creator?.phoneNumber;
  const driverName = ride.creator?.name || 'Driver';

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
    <div className="bg-white border border-ink/10 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <h4 className="font-display text-base">{ride.pickupLocation} <span className="text-ink/30 font-normal mx-1">&rarr;</span> {ride.dropoffLocation}</h4>
        <p className="text-sm text-ink-600 mt-1 font-meter">
          {isRecurring
            ? `Every ${ride.repeatDays?.map(d => WEEKDAY_SHORT[d] || d).join(' • ')} · ${new Date(ride.nextDeparture || ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : new Date(ride.departureTime).toLocaleString()}
          {' '}&middot; ₹{ride.pricePerSeat}
        </p>
        <p className="text-xs text-ink-600 mt-1">Driver: {driverName}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {driverPhone && (
          <a href={`tel:${driverPhone}`} className="text-xs font-bold text-route-600 bg-route-50 px-3 py-1.5 rounded-lg hover:bg-route-100 transition-colors">Call</a>
        )}
        {ride.creator?._id && (
          <button onClick={() => navigate(`/chat/${ride.creator._id}`, { state: { partnerName: driverName } })} className="text-xs font-bold text-ink bg-ink/5 px-3 py-1.5 rounded-lg hover:bg-ink/10 transition-colors">Message</button>
        )}

        {booking.bookingStatus !== 'cancelled' && (
          isRecurring ? (
            <>
              <button disabled={busy} onClick={cancelToday} className="text-xs font-bold text-alert-500 bg-alert-50 px-3 py-1.5 rounded-lg hover:bg-alert-400/10 transition-colors">Cancel Today's Ride</button>
              <button disabled={busy} onClick={cancelFuture} className="text-xs font-bold text-alert-500 bg-alert-50 px-3 py-1.5 rounded-lg hover:bg-alert-400/10 transition-colors">Cancel Future Bookings</button>
              {booking.bookingStatus === 'paused' ? (
                <button disabled={busy} onClick={resumeBooking} className="text-xs font-bold text-route-600 bg-route-50 px-3 py-1.5 rounded-lg hover:bg-route-100 transition-colors">Resume Booking</button>
              ) : (
                <button disabled={busy} onClick={pauseBooking} className="text-xs font-bold text-ink bg-ink/5 px-3 py-1.5 rounded-lg hover:bg-ink/10 transition-colors">Pause Booking</button>
              )}
            </>
          ) : (
            new Date(ride.departureTime) > new Date() && (
              <button disabled={busy} onClick={cancelSingle} className="text-xs font-bold text-alert-500 bg-alert-50 px-3 py-1.5 rounded-lg hover:bg-alert-400/10 transition-colors">Cancel</button>
            )
          )
        )}
      </div>
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
    <div className="flex-1 bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="font-meter text-xs tracking-[0.2em] uppercase text-route-500">Ride Partner</span>
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
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-route-500"></div></div>
        ) : entries.length === 0 ? (
          <div className="bg-white border border-dashed border-ink/15 rounded-xl p-12 text-center">
            <p className="text-ink-600 font-medium">Nothing here yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => <BookingRow key={entry.booking._id} entry={entry} onChanged={fetchBookings} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
