import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';
import StatCard from './StatCard';
import { spinner, wrap } from '../styles/style';

const PartnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);

  const headers = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };

  const loadData = async () => {
    try {
      const [history, stat] = await Promise.all([
        api.get('/api/users/history', headers),
        api.get('/api/rides/dashboard/stats', headers)
      ]);

      setRides(history.data.bookedRides || []);
      setStats(stat.data);
    } catch (err) {
      toast.error('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cancelRide = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;

    try {
      setCancelId(id);

      await api.post(
        `/api/rides/${id}/cancel`,
        {},
        headers
      );

      toast.success('Booking cancelled.');
      await loadData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to cancel booking.'
      );
    } finally {
      setCancelId(null);
    }
  };

  const now = new Date();

  const upcoming = rides.filter(
    ride =>
      new Date(ride.departureTime) > now &&
      ride.status !== 'Cancelled'
  );

  const completed = rides.filter(
    ride => new Date(ride.departureTime) <= now
  );

  const routeCount = {};

  rides.forEach(ride => {
    const route =
      `${ride.pickupLocation} to ${ride.dropoffLocation}`;

    routeCount[route] = (routeCount[route] || 0) + 1;
  });

  const favouriteRoutes = Object.entries(routeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (loading) {
    return (
      <div className={wrap.loadingRow}>
        <div className={spinner}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      <div className="flex justify-end -mb-2">
        <button
          onClick={() => navigate('/my-bookings')}
          className="text-sm font-bold text-route-600 bg-route-50 px-4 py-2 rounded-xl hover:bg-route-100 transition-colors"
        >
          Manage recurring bookings in My Bookings
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          label="Booked Rides"
          value={stats?.bookedRidesCount ?? rides.length}
          accent="ink"
        />

        <StatCard
          label="Recurring Bookings"
          value={stats?.recurringBookingsCount ?? 0}
          accent="route"
        />

        <StatCard
          label="Upcoming Trips"
          value={stats?.upcomingTripsCount ?? upcoming.length}
          accent="marigold"
        />

        <StatCard
          label="Completed Trips"
          value={stats?.completedTripsCount ?? completed.length}
          accent="rose"
        />

      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-2xl border border-ink/10 p-6">

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg">
              Booking history
            </h3>

            <button
              onClick={() => navigate('/find-ride')}
              className="bg-marigold-500 hover:bg-marigold-400 text-ink text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              + Find a ride
            </button>
          </div>

          {rides.length === 0 ? (
            <div className="bg-paper border border-dashed border-ink/15 rounded-xl p-10 text-center">
              <p className="text-ink-600">
                You haven't booked any seats yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {rides.map(ride => {
                const future =
                  new Date(ride.departureTime) > now;

                const cancelled =
                  ride.status === 'Cancelled';

                return (
                  <div
                    key={ride._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper/60 border border-ink/10 rounded-xl p-4"
                  >

                    <div>
                      <h4 className="font-display text-sm">
                        {ride.pickupLocation}

                        <span className="text-ink/30 font-normal mx-1">
                          to
                        </span>

                        {ride.dropoffLocation}
                      </h4>

                      <p className="text-xs text-ink-600 mt-1 font-meter">
                        {new Date(
                          ride.departureTime
                        ).toLocaleString()}

                        {' · ₹'}

                        {ride.pricePerSeat}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          cancelled
                            ? 'bg-ink/5 text-ink/40 border-ink/10'
                            : future
                              ? 'bg-route-50 text-route-600 border-route-100'
                              : 'bg-ink/5 text-ink/40 border-ink/10'
                        }`}
                      >
                        {cancelled
                          ? 'Cancelled'
                          : future
                            ? 'Upcoming'
                            : 'Completed'}
                      </span>

                      {future && !cancelled && (
                        <button
                          onClick={() => cancelRide(ride._id)}
                          disabled={cancelId === ride._id}
                          className="text-[11px] font-bold text-alert-500 bg-alert-50 px-3 py-1.5 rounded-lg hover:bg-alert-400/10 transition-colors disabled:opacity-50"
                        >
                          {cancelId === ride._id
                            ? 'Cancelling...'
                            : 'Cancel'}
                        </button>
                      )}

                      {ride.creator && (
                        <button
                          onClick={() =>
                            navigate(`/chat/${ride.creator}`, {
                              state: {
                                partnerName: 'Driver'
                              }
                            })
                          }
                          className="text-[11px] font-bold text-ink bg-ink/5 px-3 py-1.5 rounded-lg hover:bg-ink/10 transition-colors"
                        >
                          Message
                        </button>
                      )}

                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-ink/10 p-6">

          <h3 className="font-display text-lg mb-4">
            Favourite routes
          </h3>

          {favouriteRoutes.length === 0 ? (
            <p className="text-ink-600 text-sm">
              Book a few rides to see your most-travelled
              routes here.
            </p>
          ) : (
            <div className="space-y-3">

              {favouriteRoutes.map(([route, count]) => (
                <div
                  key={route}
                  className="flex items-center justify-between bg-paper/60 rounded-lg p-3"
                >

                  <span className="text-sm font-medium text-ink truncate">
                    {route}
                  </span>

                  <span className="text-xs font-bold text-marigold-600 bg-marigold-500/10 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                    {count}x
                  </span>

                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;