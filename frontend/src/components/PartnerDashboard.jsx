import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';
import StatCard from './StatCard';

const PartnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
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
    }
  };

  const now = new Date();
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
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-end -mb-2">
        <button onClick={() => navigate('/my-bookings')} className="text-sm font-bold text-route-600 bg-route-50 px-4 py-2 rounded-xl hover:bg-route-100 transition-colors">
          Manage recurring bookings in My Bookings →
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              + Find a ride
            </button>
          </div>

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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-ink/10 p-6">
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
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
