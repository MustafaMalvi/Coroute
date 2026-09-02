<<<<<<< HEAD
import { useState, useEffect, useContext } from 'react';
=======
import { useState, useEffect, useContext, useCallback } from 'react';
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';
import StatCard from './StatCard';
<<<<<<< HEAD
import { spinner, wrap } from '../styles/style';
=======
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9

const PartnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
<<<<<<< HEAD

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
=======
  const [bookedRides, setBookedRides] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get('/api/users/history', { headers: { Authorization: `Bearer ${user.token}` } });
      setBookedRides(res.data.bookedRides);
    } catch (err) {
      toast.error('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/api/rides/dashboard/stats', { headers: { Authorization: `Bearer ${user.token}` } });
      setStats(res.data);
    } catch (err) {
      // Non-critical
    }
  }, [user.token]);

  useEffect(() => { fetchHistory(); fetchStats(); }, [fetchHistory, fetchStats]);

  const handleCancel = async (rideId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      setCancellingId(rideId);
      await api.post(`/api/rides/${rideId}/cancel`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Booking cancelled.');
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
    }
  };

  const now = new Date();
<<<<<<< HEAD

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
=======
  const upcoming = bookedRides.filter(r => new Date(r.departureTime) > now && r.status !== 'Cancelled');
  const completed = bookedRides.filter(r => new Date(r.departureTime) <= now);
  const savedMoney = bookedRides.reduce((sum, r) => {
    const totalSeats = r.totalSeats || 3;
    return sum + (r.pricePerSeat || 0) * Math.max(totalSeats - 1, 0) / totalSeats;
  }, 0);

  const routeCounts = {};
  bookedRides.forEach(r => {
    const key = `${r.pickupLocation} → ${r.dropoffLocation}`;
    routeCounts[key] = (routeCounts[key] || 0) + 1;
  });
  const favouriteRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-route-500"></div></div>;
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
  }

  return (
    <div className="space-y-8 animate-fade-in">
<<<<<<< HEAD

      <div className="flex justify-end -mb-2">
        <button
          onClick={() => navigate('/my-bookings')}
          className="text-sm font-bold text-route-600 bg-route-50 px-4 py-2 rounded-xl hover:bg-route-100 transition-colors"
        >
          Manage recurring bookings in My Bookings
=======
      <div className="flex justify-end -mb-2">
        <button onClick={() => navigate('/my-bookings')} className="text-sm font-bold text-route-600 bg-route-50 px-4 py-2 rounded-xl hover:bg-route-100 transition-colors">
          Manage recurring bookings in My Bookings →
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
<<<<<<< HEAD

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
=======
        <StatCard label="Booked Rides" value={stats?.bookedRidesCount ?? bookedRides.length} accent="ink" />
        <StatCard label="Recurring Bookings" value={stats?.recurringBookingsCount ?? 0} accent="route" />
        <StatCard label="Upcoming Trips" value={stats?.upcomingTripsCount ?? upcoming.length} accent="marigold" />
        <StatCard label="Completed Trips" value={stats?.completedTripsCount ?? completed.length} accent="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ink/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg">Booking history</h3>
            <button onClick={() => navigate('/find-ride')} className="bg-marigold-500 hover:bg-marigold-400 text-ink text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95">
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
              + Find a ride
            </button>
          </div>

<<<<<<< HEAD
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

=======
          {bookedRides.length === 0 ? (
            <div className="bg-paper border border-dashed border-ink/15 rounded-xl p-10 text-center">
              <p className="text-ink-600">You haven't booked any seats yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookedRides.map(ride => {
                const isFuture = new Date(ride.departureTime) > now;
                return (
                  <div key={ride._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper/60 border border-ink/10 rounded-xl p-4">
                    <div>
                      <h4 className="font-display text-sm">{ride.pickupLocation} <span className="text-ink/30 font-normal mx-1">&rarr;</span> {ride.dropoffLocation}</h4>
                      <p className="text-xs text-ink-600 mt-1 font-meter">{new Date(ride.departureTime).toLocaleString()} &middot; ₹{ride.pricePerSeat}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        ride.status === 'Cancelled' ? 'bg-ink/5 text-ink/40 border-ink/10'
                        : isFuture ? 'bg-route-50 text-route-600 border-route-100'
                        : 'bg-ink/5 text-ink/40 border-ink/10'
                      }`}>
                        {ride.status === 'Cancelled' ? 'Cancelled' : isFuture ? 'Upcoming' : 'Completed'}
                      </span>
                      {isFuture && ride.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancel(ride._id)}
                          disabled={cancellingId === ride._id}
                          className="text-[11px] font-bold text-alert-500 bg-alert-50 px-3 py-1.5 rounded-lg hover:bg-alert-400/10 transition-colors disabled:opacity-50"
                        >
                          {cancellingId === ride._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      {ride.creator && (
                        <button onClick={() => navigate(`/chat/${ride.creator}`, { state: { partnerName: 'Driver' } })} className="text-[11px] font-bold text-ink bg-ink/5 px-3 py-1.5 rounded-lg hover:bg-ink/10 transition-colors">
                          Message
                        </button>
                      )}
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

        <div className="bg-white rounded-2xl border border-ink/10 p-6">
<<<<<<< HEAD

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

=======
          <h3 className="font-display text-lg mb-4">Favourite routes</h3>
          {favouriteRoutes.length === 0 ? (
            <p className="text-ink-600 text-sm">Book a few rides to see your most-travelled routes here.</p>
          ) : (
            <div className="space-y-3">
              {favouriteRoutes.map(([route, count]) => (
                <div key={route} className="flex items-center justify-between bg-paper/60 rounded-lg p-3">
                  <span className="text-sm font-medium text-ink truncate">{route}</span>
                  <span className="text-xs font-bold text-marigold-600 bg-marigold-500/10 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">{count}&times;</span>
                </div>
              ))}
            </div>
          )}
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default PartnerDashboard;
=======
export default PartnerDashboard;
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
