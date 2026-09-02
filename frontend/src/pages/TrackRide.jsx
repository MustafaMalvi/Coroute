<<<<<<< HEAD
import { useContext, useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { heading, spinner, wrap } from '../styles/style';

const LiveMap = lazy(() => import('../components/mapbox'));

const pickTrackableRides = (role, data) => {
  if (role === 'host') {
    const now = new Date();
    return [...data.recurring, ...data.upcomingOneTime]
      .filter(r => r.rideType === 'recurring' ? r.occursToday : new Date(r.departureTime) > now)
      .map(r => ({ ride: r, counterpart: `${r.passengers?.length || 0} rider${r.passengers?.length === 1 ? '' : 's'}` }));
  }
  return [...data.recurringBookings, ...data.upcomingRides]
    .map(({ ride }) => ({ ride, counterpart: ride.creator?.name || 'your driver' }));
};

const RidePickerRow = ({ ride, counterpart, onClick }) => (
  <button onClick={onClick} className="w-full text-left bg-white border border-ink/10 rounded-2xl shadow-sm p-5 hover:border-route-300 transition-colors">
    <h4 className={heading.card}>{ride.pickupLocation} <span className="text-ink/30 font-normal mx-1">&rarr;</span> {ride.dropoffLocation}</h4>
    <p className={heading.helper}>
      {ride.rideType === 'recurring'
        ? `Today · ${new Date(ride.nextDeparture || ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : new Date(ride.departureTime).toLocaleString()}
    </p>
    <p className="text-xs text-ink-600 mt-1">With {counterpart}</p>
  </button>
);

const TrackRide = () => {
  const { user } = useContext(AuthContext);
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRide, setActiveRide] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };
        if (user.role === 'host') {
          const res = await api.get('/api/rides/my-rides', authHeader);
          setOptions(pickTrackableRides('host', res.data));
        } else {
          const res = await api.get('/api/rides/my-bookings', authHeader);
          setOptions(pickTrackableRides('partner', res.data));
        }
      } catch (err) {
        toast.error('Failed to load trackable rides.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.token, user.role]);

  useEffect(() => {
    if (!rideId) {
      setActiveRide(null);
      return;
    }
    const match = options.find(o => o.ride._id === rideId);
    if (match) setActiveRide(match);
  }, [rideId, options]);

  const counterpartLabel = activeRide?.counterpart
    || (user.role === 'host' ? 'your rider' : 'your driver');

  return (
    <div className={wrap.page}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <span className={heading.eyebrowRoute}>Live position</span>
          <h1 className="font-display text-3xl mt-2">{rideId ? 'Track this ride' : 'Track a ride'}</h1>
          <p className="text-ink-600 mt-2 text-sm">
            {rideId
              ? `See your live position and ${counterpartLabel}'s, side by side.`
              : user.role === 'host'
                ? "Pick one of today's rides to share your location with your riders."
                : 'Pick an upcoming booking to see your driver on the map.'}
          </p>
        </div>

        {!rideId ? (
          loading ? (
            <div className={wrap.loadingRow}><div className={spinner}></div></div>
          ) : options.length === 0 ? (
            <div className="bg-white border border-dashed border-ink/15 rounded-xl p-12 text-center">
              <p className="text-ink-600 font-medium">
                {user.role === 'host' ? "You don't have a ride happening today." : "You don't have an upcoming ride to track yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {options.map(({ ride, counterpart }) => (
                <RidePickerRow key={ride._id} ride={ride} counterpart={counterpart} onClick={() => navigate(`/track-ride/${ride._id}`)} />
              ))}
            </div>
          )
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-6 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-ink rounded-full flex items-center justify-center text-marigold-500 font-display text-lg">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-bold text-ink">{user?.name || 'Student'}</p>
                <p className="text-sm text-ink-600 flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-route-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-route-500"></span>
                  </span>
                  Live tracking active
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-4 sm:p-6">
              <Suspense fallback={
                <div className="h-72 sm:h-[28rem] w-full rounded-2xl flex items-center justify-center bg-ink/[0.03] border border-ink/10">
                  <div className={spinner}></div>
                </div>
              }>
                <LiveMap rideId={rideId} otherLabel={counterpartLabel} />
              </Suspense>
            </div>

            <div className="mt-6 bg-marigold-50 border border-marigold-100 rounded-xl p-4 text-sm text-marigold-700">
              <p className="font-bold mb-1">Tips for accurate tracking</p>
              <ul className="list-disc list-inside space-y-1 text-marigold-600">
                <li>Tap "Share my location" so {counterpartLabel} can see you on the map.</li>
                <li>Make sure GPS / Location Services are enabled on your device.</li>
                <li>The map updates automatically as you move — no need to refresh.</li>
              </ul>
            </div>
          </>
        )}
=======
import { useContext, Suspense, lazy } from 'react';
import { AuthContext } from '../context/AuthContext';

const LiveMap = lazy(() => import('../components/mapbox'));
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

const TrackRide = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex-1 bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <span className="font-meter text-xs tracking-[0.2em] uppercase text-route-500">Live position</span>
          <h1 className="font-display text-3xl mt-2">Track my ride</h1>
          <p className="text-ink-600 mt-2 text-sm">See your real-time location on the map while you're on the move.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-6 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-ink rounded-full flex items-center justify-center text-marigold-500 font-display text-lg">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-bold text-ink">{user?.name || 'Student'}</p>
            <p className="text-sm text-ink-600 flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-route-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-route-500"></span>
              </span>
              Live tracking active
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-4 sm:p-6">
          <Suspense fallback={
            <div className="h-72 sm:h-[28rem] w-full rounded-2xl flex items-center justify-center bg-ink/[0.03] border border-ink/10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-route-500"></div>
            </div>
          }>
            <LiveMap />
          </Suspense>
        </div>

        <div className="mt-6 bg-marigold-50 border border-marigold-100 rounded-xl p-4 text-sm text-marigold-700">
          <p className="font-bold mb-1">Tips for accurate tracking</p>
          <ul className="list-disc list-inside space-y-1 text-marigold-600">
            <li>Make sure GPS / Location Services are enabled on your device.</li>
            <li>For best accuracy, use your phone's browser while on the move.</li>
            <li>The map updates automatically as you move — no need to refresh.</li>
          </ul>
        </div>
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
      </div>
    </div>
  );
};

export default TrackRide;
