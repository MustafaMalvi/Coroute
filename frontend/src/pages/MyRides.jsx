<<<<<<< HEAD
import { useState, useEffect, useContext } from 'react';
=======
import { useState, useEffect, useContext, useCallback } from 'react';
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';
<<<<<<< HEAD
import { badge, heading, spinner, wrap } from '../styles/style';

const days = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun'
};

const tabs = [
  { key: 'upcomingOneTime', label: 'Upcoming One-Time Rides' },
  { key: 'recurring', label: 'Recurring Rides' },
  { key: 'completed', label: 'Completed Rides' },
  { key: 'cancelled', label: 'Cancelled Rides' }
];

const RescheduleModal = ({
  ride,
  mode,
  onClose,
  onDone,
  auth
}) => {
=======

const WEEKDAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };
const TABS = [
  { key: 'upcomingOneTime', label: 'Upcoming One-Time Rides' },
  { key: 'recurring', label: 'Recurring Rides' },
  { key: 'completed', label: 'Completed Rides' },
  { key: 'cancelled', label: 'Cancelled Rides' },
];

const RescheduleModal = ({ ride, mode, onClose, onDone, authHeader }) => {
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
  const [time, setTime] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
<<<<<<< HEAD
    if (!/^\d{2}:\d{2}$/.test(time)) {
      toast.error('Pick a valid time.');
      return;
    }

    try {
      setSaving(true);

      const type =
        mode === 'today'
          ? 'reschedule-today'
          : 'reschedule-schedule';

      const res = await api.patch(
        `/api/rides/${ride._id}/${type}`,
        { departureTimeStr: time },
        { headers: auth }
      );

      toast.success(res.data.message);
      onDone();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed to reschedule.'
      );
=======
    if (!/^\d{2}:\d{2}$/.test(time)) { toast.error('Pick a valid time.'); return; }
    try {
      setSaving(true);
      const endpoint = mode === 'today' ? 'reschedule-today' : 'reschedule-schedule';
      const res = await api.patch(`/api/rides/${ride._id}/${endpoint}`, { departureTimeStr: time }, { headers: authHeader });
      toast.success(res.data.message);
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule.');
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    } finally {
      setSaving(false);
    }
  };

<<<<<<< HEAD
  const today = mode === 'today';

  return (
    <div
      className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-ink/10 p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-display text-lg mb-1">
          {today
            ? "Reschedule Today's Ride"
            : 'Reschedule Entire Schedule'}
        </h3>

        <p className="text-ink-600 text-sm mb-4">
          {today
            ? "Only today's ride will use this time."
            : 'All future rides will use this time.'}
        </p>

        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-ink/5 hover:bg-ink/10 text-ink font-semibold py-2.5 rounded-xl transition-all"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 bg-marigold-500 hover:bg-marigold-400 text-ink font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
=======
  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-ink/10 p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-1">{mode === 'today' ? "Reschedule Today's Ride" : 'Reschedule Entire Schedule'}</h3>
        <p className="text-ink-600 text-sm mb-4">{mode === 'today' ? "Only today's occurrence will use this time." : 'All future occurrences update to this time.'}</p>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full py-2.5 px-3 bg-paper border border-ink/15 rounded-xl mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-ink/5 hover:bg-ink/10 text-ink font-semibold py-2.5 rounded-xl transition-all">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 bg-marigold-500 hover:bg-marigold-400 text-ink font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
            {saving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RideRow = ({ ride, onChanged }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
<<<<<<< HEAD

  const [busy, setBusy] = useState(false);
  const [reschedule, setReschedule] = useState(null);

  const auth = {
    Authorization: `Bearer ${user.token}`
  };

  const recurring = ride.rideType === 'recurring';

  const action = async (fn, msg) => {
    try {
      setBusy(true);

      const res = await fn();

      toast.success(res.data.message || msg);
      onChanged();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Action failed.'
      );
=======
  const authHeader = { Authorization: `Bearer ${user.token}` };
  const [busy, setBusy] = useState(false);
  const [rescheduleMode, setRescheduleMode] = useState(null); // 'today' | 'schedule' | null

  const isRecurring = ride.rideType === 'recurring';

  const call = async (fn, successMsg) => {
    try {
      setBusy(true);
      const res = await fn();
      toast.success(res.data.message || successMsg);
      onChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    } finally {
      setBusy(false);
    }
  };

<<<<<<< HEAD
  const pause = () =>
    action(
      () =>
        api.patch(
          `/api/rides/${ride._id}/pause`,
          {},
          { headers: auth }
        ),
      'Ride paused.'
    );

  const resume = () =>
    action(
      () =>
        api.patch(
          `/api/rides/${ride._id}/resume`,
          {},
          { headers: auth }
        ),
      'Ride resumed.'
    );

  const cancelToday = () =>
    action(
      () =>
        api.patch(
          `/api/rides/${ride._id}/cancel-today`,
          {},
          { headers: auth }
        ),
      "Today's ride cancelled."
    );

  const cancelTomorrow = () =>
    action(
      () =>
        api.patch(
          `/api/rides/${ride._id}/cancel-tomorrow`,
          {},
          { headers: auth }
        ),
      "Tomorrow's ride cancelled."
    );

  const deleteRide = () => {
    if (
      !window.confirm(
        'Delete this ride permanently? This cannot be undone.'
      )
    ) {
      return;
    }

    action(
      () =>
        api.delete(
          `/api/rides/${ride._id}`,
          { headers: auth }
        ),
      'Ride deleted.'
    );
  };

  const cancelRide = () => {
    if (!window.confirm('Cancel this ride?')) {
      return;
    }

    action(
      () =>
        api.post(
          `/api/rides/${ride._id}/cancel-ride`,
          {},
          { headers: auth }
        ),
      'Ride cancelled.'
    );
  };

  const message = (id, name) => {
    navigate(`/chat/${id}`, {
      state: { partnerName: name }
    });
  };

  const canTrack =
    recurring
      ? ride.occursToday
      : ride.status !== 'Cancelled' &&
        new Date(ride.departureTime) > new Date();

  const canCancel =
    !recurring &&
    ride.status !== 'Cancelled' &&
    new Date(ride.departureTime) > new Date();

  return (
    <div className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden">

      <div className="p-5 border-b border-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div>
          <div className="flex items-center gap-2 mb-1">

            <span
              className={
                recurring
                  ? 'text-[11px] font-bold text-route-600 bg-route-50 border border-route-100 px-2.5 py-0.5 rounded-full'
                  : 'text-[11px] font-bold text-marigold-600 bg-marigold-500/10 border border-marigold-500/20 px-2.5 py-0.5 rounded-full'
              }
            >
              {recurring ? 'Recurring' : 'One-Time'}
            </span>

            {ride.status === 'Paused' && (
              <span className="text-[11px] font-bold text-ink/50 bg-ink/5 px-2.5 py-0.5 rounded-full">
                Paused
              </span>
            )}

            {ride.status === 'Cancelled' && (
              <span className="text-[11px] font-bold text-alert-500 bg-alert-50 px-2.5 py-0.5 rounded-full">
                Cancelled
              </span>
            )}

          </div>

          <h4 className={heading.card}>
            {ride.pickupLocation}

            <span className="text-ink/30 font-normal mx-1">
              to
            </span>

            {ride.dropoffLocation}
          </h4>

          <p className={heading.helper}>
            {recurring ? (
              <>
                Every{' '}
                {ride.repeatDays
                  ?.map(day => days[day] || day)
                  .join(' / ')}
                {' · '}
                {new Date(
                  ride.nextDeparture || ride.departureTime
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </>
            ) : (
              new Date(
                ride.departureTime
              ).toLocaleString()
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-ink/5 text-ink-600 text-xs font-bold px-3 py-1 rounded-full">
            {ride.availableSeats} seats left
          </span>
        </div>

      </div>

      <div className="p-5 bg-paper/60 flex flex-wrap gap-2">

        {canTrack && (
          <button
            onClick={() =>
              navigate(`/track-ride/${ride._id}`)
            }
            className="text-xs font-bold text-route-600 bg-route-50 px-3 py-1.5 rounded-lg hover:bg-route-100 transition-colors"
          >
            Track
          </button>
        )}

        {recurring ? (
          <>
            {ride.status === 'Paused' ? (
              <button
                disabled={busy}
                onClick={resume}
                className={badge.route}
              >
                Resume
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={pause}
                className="text-xs font-bold text-ink bg-white border border-ink/10 px-3 py-1.5 rounded-lg hover:bg-ink/5 transition-colors"
              >
                Pause
              </button>
            )}

            <button
              disabled={busy}
              onClick={cancelToday}
              className={badge.danger}
            >
              Cancel Today's Ride
            </button>

            <button
              disabled={busy}
              onClick={cancelTomorrow}
              className={badge.danger}
            >
              Cancel Tomorrow's Ride
            </button>

            <button
              disabled={busy}
              onClick={() => setReschedule('today')}
              className={badge.route}
            >
              Reschedule Today's Ride
            </button>

            <button
              disabled={busy}
              onClick={() => setReschedule('schedule')}
              className={badge.route}
            >
              Reschedule Entire Schedule
            </button>

            <button
              disabled={busy}
              onClick={deleteRide}
              className="text-xs font-bold text-white bg-alert-500 px-3 py-1.5 rounded-lg hover:bg-alert-600 transition-colors"
            >
              Delete Permanently
            </button>
          </>
        ) : (
          canCancel && (
            <>
              <button
                disabled={busy}
                onClick={cancelRide}
                className={badge.danger}
              >
                Cancel Ride
              </button>

              <button
                disabled={busy}
                onClick={deleteRide}
                className="text-xs font-bold text-white bg-alert-500 px-3 py-1.5 rounded-lg hover:bg-alert-600 transition-colors"
              >
                Delete Permanently
              </button>
            </>
          )
        )}

      </div>

      <div className="p-5 border-t border-ink/10">

        <h5 className="text-xs font-bold text-ink-600 uppercase tracking-wider mb-3">
          Passengers ({ride.passengers?.length || 0})
        </h5>

        {!ride.passengers?.length ? (
          <p className="text-ink/40 text-sm italic">
            No one has booked this ride yet.
          </p>
        ) : (
          <div className="grid gap-3">

            {ride.passengers.map((passenger, index) => {
              const person = passenger.userId;

              if (!person) {
                return null;
              }

              return (
                <div
                  key={person._id || index}
                  className="flex items-center justify-between bg-white rounded-xl p-4 border border-ink/10"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 bg-marigold-500/15 rounded-full flex items-center justify-center text-marigold-600 font-display text-sm">
                      {person.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    <div>
                      <span className="font-semibold text-ink">
                        {person.name}
                      </span>

                      {passenger.bookingType === 'recurring' && (
                        <span className="block text-[11px] text-route-600 font-bold">
                          Recurring booking
                        </span>
                      )}
                    </div>

                  </div>

                  <div className="flex items-center gap-2">

                    {person.phoneNumber && (
                      <a
                        href={`tel:${person.phoneNumber}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-route-600 bg-route-50 px-3 py-2 rounded-lg hover:bg-route-100 transition-colors"
                      >
                        Call
                      </a>
                    )}

                    <button
                      onClick={() =>
                        message(person._id, person.name)
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-ink/5 px-3 py-2 rounded-lg hover:bg-ink/10 transition-colors"
                    >
                      Message
                    </button>

=======
  const handlePause = () => call(() => api.patch(`/api/rides/${ride._id}/pause`, {}, { headers: authHeader }), 'Ride paused.');
  const handleResume = () => call(() => api.patch(`/api/rides/${ride._id}/resume`, {}, { headers: authHeader }), 'Ride resumed.');
  const handleCancelToday = () => call(() => api.patch(`/api/rides/${ride._id}/cancel-today`, {}, { headers: authHeader }), "Today's ride cancelled.");
  const handleCancelTomorrow = () => call(() => api.patch(`/api/rides/${ride._id}/cancel-tomorrow`, {}, { headers: authHeader }), "Tomorrow's ride cancelled.");
  const handleDelete = () => {
    if (!window.confirm('Delete this ride permanently? This cannot be undone.')) return;
    call(() => api.delete(`/api/rides/${ride._id}`, { headers: authHeader }), 'Ride deleted.');
  };
  const handleCancelRide = () => {
    if (!window.confirm('Cancel this ride?')) return;
    call(() => api.post(`/api/rides/${ride._id}/cancel-ride`, {}, { headers: authHeader }), 'Ride cancelled.');
  };
  const handleMessage = (passengerId, passengerName) => navigate(`/chat/${passengerId}`, { state: { partnerName: passengerName } });

  return (
    <div className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isRecurring ? (
              <span className="text-[11px] font-bold text-route-600 bg-route-50 border border-route-100 px-2.5 py-0.5 rounded-full">🔁 Recurring</span>
            ) : (
              <span className="text-[11px] font-bold text-marigold-600 bg-marigold-500/10 border border-marigold-500/20 px-2.5 py-0.5 rounded-full">📅 One-Time</span>
            )}
            {ride.status === 'Paused' && <span className="text-[11px] font-bold text-ink/50 bg-ink/5 px-2.5 py-0.5 rounded-full">Paused</span>}
            {ride.status === 'Cancelled' && <span className="text-[11px] font-bold text-alert-500 bg-alert-50 px-2.5 py-0.5 rounded-full">Cancelled</span>}
          </div>
          <h4 className="font-display text-base">
            {ride.pickupLocation} <span className="text-ink/30 font-normal mx-1">&rarr;</span> {ride.dropoffLocation}
          </h4>
          <p className="text-sm text-ink-600 mt-1 font-meter">
            {isRecurring
              ? `Every ${ride.repeatDays?.map(d => WEEKDAY_SHORT[d] || d).join(' • ')} · ${new Date(ride.nextDeparture || ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : new Date(ride.departureTime).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-ink/5 text-ink-600 text-xs font-bold px-3 py-1 rounded-full">{ride.availableSeats} seats left</span>
        </div>
      </div>

      <div className="p-5 bg-paper/60 flex flex-wrap gap-2">
        {isRecurring ? (
          <>
            {ride.status !== 'Paused' ? (
              <button disabled={busy} onClick={handlePause} className="text-xs font-bold text-ink bg-white border border-ink/10 px-3 py-1.5 rounded-lg hover:bg-ink/5 transition-colors">Pause</button>
            ) : (
              <button disabled={busy} onClick={handleResume} className="text-xs font-bold text-route-600 bg-route-50 px-3 py-1.5 rounded-lg hover:bg-route-100 transition-colors">Resume</button>
            )}
            <button disabled={busy} onClick={handleCancelToday} className="text-xs font-bold text-alert-500 bg-alert-50 px-3 py-1.5 rounded-lg hover:bg-alert-400/10 transition-colors">Cancel Today's Ride</button>
            <button disabled={busy} onClick={handleCancelTomorrow} className="text-xs font-bold text-alert-500 bg-alert-50 px-3 py-1.5 rounded-lg hover:bg-alert-400/10 transition-colors">Cancel Tomorrow's Ride</button>
            <button disabled={busy} onClick={() => setRescheduleMode('today')} className="text-xs font-bold text-route-600 bg-route-50 px-3 py-1.5 rounded-lg hover:bg-route-100 transition-colors">Reschedule Today's Ride</button>
            <button disabled={busy} onClick={() => setRescheduleMode('schedule')} className="text-xs font-bold text-route-600 bg-route-50 px-3 py-1.5 rounded-lg hover:bg-route-100 transition-colors">Reschedule Entire Schedule</button>
            <button disabled={busy} onClick={handleDelete} className="text-xs font-bold text-white bg-alert-500 px-3 py-1.5 rounded-lg hover:bg-alert-600 transition-colors">Delete Permanently</button>
          </>
        ) : (
          ride.status !== 'Cancelled' && new Date(ride.departureTime) > new Date() && (
            <>
              <button disabled={busy} onClick={handleCancelRide} className="text-xs font-bold text-alert-500 bg-alert-50 px-3 py-1.5 rounded-lg hover:bg-alert-400/10 transition-colors">Cancel Ride</button>
              <button disabled={busy} onClick={handleDelete} className="text-xs font-bold text-white bg-alert-500 px-3 py-1.5 rounded-lg hover:bg-alert-600 transition-colors">Delete Permanently</button>
            </>
          )
        )}
      </div>

      <div className="p-5 border-t border-ink/10">
        <h5 className="text-xs font-bold text-ink-600 uppercase tracking-wider mb-3">Passengers ({ride.passengers?.length || 0})</h5>
        {(!ride.passengers || ride.passengers.length === 0) ? (
          <p className="text-ink/40 text-sm italic">No one has booked this ride yet.</p>
        ) : (
          <div className="grid gap-3">
            {ride.passengers.map((passenger, idx) => {
              const pUser = passenger.userId;
              if (!pUser) return null;
              return (
                <div key={pUser._id || idx} className="flex items-center justify-between bg-white rounded-xl p-4 border border-ink/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-marigold-500/15 rounded-full flex items-center justify-center text-marigold-600 font-display text-sm">
                      {pUser.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <span className="font-semibold text-ink">{pUser.name}</span>
                      {passenger.bookingType === 'recurring' && <span className="block text-[11px] text-route-600 font-bold">Recurring booking</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pUser.phoneNumber && (
                      <a href={`tel:${pUser.phoneNumber}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-route-600 bg-route-50 px-3 py-2 rounded-lg hover:bg-route-100 transition-colors">Call</a>
                    )}
                    <button onClick={() => handleMessage(pUser._id, pUser.name)} className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-ink/5 px-3 py-2 rounded-lg hover:bg-ink/10 transition-colors">Message</button>
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
                  </div>
                </div>
              );
            })}
<<<<<<< HEAD

=======
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
          </div>
        )}
      </div>

<<<<<<< HEAD
      {reschedule && (
        <RescheduleModal
          ride={ride}
          mode={reschedule}
          auth={auth}
          onClose={() => setReschedule(null)}
          onDone={() => {
            setReschedule(null);
            onChanged();
          }}
        />
      )}

=======
      {rescheduleMode && (
        <RescheduleModal ride={ride} mode={rescheduleMode} onClose={() => setRescheduleMode(null)} authHeader={authHeader}
          onDone={() => { setRescheduleMode(null); onChanged(); }} />
      )}
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    </div>
  );
};

const MyRides = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
<<<<<<< HEAD

  const [data, setData] = useState({
    upcomingOneTime: [],
    recurring: [],
    completed: [],
    cancelled: []
  });

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcomingOneTime');

  const loadRides = async () => {
    try {
      const res = await api.get(
        '/api/rides/my-rides',
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

=======
  const [data, setData] = useState({ upcomingOneTime: [], recurring: [], completed: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcomingOneTime');

  const fetchRides = useCallback(async () => {
    try {
      const res = await api.get('/api/rides/my-rides', { headers: { Authorization: `Bearer ${user.token}` } });
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load your rides.');
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  };

  useEffect(() => {
    loadRides();
  }, []);
=======
  }, [user.token]);

  useEffect(() => { fetchRides(); }, [fetchRides]);
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9

  const rides = data[tab] || [];

  return (
<<<<<<< HEAD
    <div className={wrap.page}>
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

          <div>
            <span className={heading.eyebrowRoute}>
              Ride Host
            </span>

            <h1 className="font-display text-3xl mt-1">
              My Rides
            </h1>
          </div>

          <button
            onClick={() => navigate('/offer-ride')}
            className="bg-marigold-500 hover:bg-marigold-400 text-ink text-sm font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
          >
            + Offer a ride
          </button>

        </div>

        <div className="flex flex-wrap gap-2 mb-6">

          {tabs.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                tab === item.key
                  ? 'bg-ink text-marigold-500'
                  : 'bg-white border border-ink/10 text-ink-600 hover:border-ink/20'
              }`}
            >
              {item.label}{' '}
              <span className="opacity-60">
                ({data[item.key]?.length || 0})
              </span>
            </button>
          ))}

        </div>

        {loading ? (
          <div className={wrap.loadingRow}>
            <div className={spinner}></div>
          </div>
        ) : rides.length === 0 ? (
          <div className="bg-white border border-dashed border-ink/15 rounded-xl p-12 text-center">
            <p className="text-ink-600 font-medium">
              Nothing here yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {rides.map(ride => (
              <RideRow
                key={ride._id}
                ride={ride}
                onChanged={loadRides}
              />
            ))}
          </div>
        )}

=======
    <div className="flex-1 bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="font-meter text-xs tracking-[0.2em] uppercase text-route-500">Ride Host</span>
            <h1 className="font-display text-3xl mt-1">My Rides</h1>
          </div>
          <button onClick={() => navigate('/offer-ride')} className="bg-marigold-500 hover:bg-marigold-400 text-ink text-sm font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95">
            + Offer a ride
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
        ) : rides.length === 0 ? (
          <div className="bg-white border border-dashed border-ink/15 rounded-xl p-12 text-center">
            <p className="text-ink-600 font-medium">Nothing here yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {rides.map(ride => <RideRow key={ride._id} ride={ride} onChanged={fetchRides} />)}
          </div>
        )}
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default MyRides;
=======
export default MyRides;
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
