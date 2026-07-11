import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';
import StatCard from './StatCard';
import MiniBarChart from './MiniBarChart';

const EditRideRow = ({ ride, onCancel, onSaved }) => {
  const { user } = useContext(AuthContext);
  const [seats, setSeats] = useState(ride.totalSeats || ride.availableSeats);
  const [price, setPrice] = useState(ride.pricePerSeat);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put(`/api/rides/${ride._id}`, {
        availableSeats: Number(seats),
        pricePerSeat: Number(price),
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Ride updated successfully!');
      onSaved(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ride.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-3 bg-marigold-50 border border-marigold-100 rounded-xl p-4">
      <div>
        <label className="block text-[10px] font-bold uppercase text-ink/40 mb-1">Seats</label>
        <input type="number" min="1" max="4" value={seats} onChange={(e) => setSeats(e.target.value)} className="w-20 py-2 px-3 bg-white border border-ink/15 rounded-lg text-sm" />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase text-ink/40 mb-1">Price (₹)</label>
        <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-24 py-2 px-3 bg-white border border-ink/15 rounded-lg text-sm" />
      </div>
      <button onClick={handleSave} disabled={saving} className="bg-ink text-marigold-500 text-xs font-bold px-4 py-2 rounded-lg hover:bg-ink-700 transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : 'Save'}
      </button>
      <button onClick={onCancel} className="text-xs font-bold px-4 py-2 rounded-lg text-ink/50 hover:bg-ink/5 transition-colors">
        Cancel
      </button>
    </div>
  );
};

const HostDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const fetchRides = useCallback(async () => {
    try {
      const res = await api.get('/api/rides/my-rides', { headers: { Authorization: `Bearer ${user.token}` } });
      setRides(res.data.all || []);
    } catch (err) {
      toast.error('Failed to load your rides.');
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

  useEffect(() => { fetchRides(); fetchStats(); }, [fetchRides, fetchStats]);

  const handleDelete = async (rideId) => {
    if (!window.confirm('Delete this ride? This cannot be undone.')) return;
    try {
      await api.delete(`/api/rides/${rideId}`, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Ride deleted.');
      setRides(prev => prev.filter(r => r._id !== rideId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete ride.');
    }
  };

  const handleMessage = (passengerId, passengerName) => {
    navigate(`/chat/${passengerId}`, { state: { partnerName: passengerName } });
  };

  const now = new Date();
  const upcoming = rides.filter(r => new Date(r.departureTime) > now);
  const completed = rides.filter(r => new Date(r.departureTime) <= now);
  const totalPassengers = rides.reduce((sum, r) => sum + (r.passengers?.length || 0), 0);
  const today = new Date().toDateString();
  const todaysEarnings = rides
    .filter(r => new Date(r.departureTime).toDateString() === today)
    .reduce((sum, r) => sum + (r.passengers?.length || 0) * (r.pricePerSeat || 0), 0);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const count = rides.filter(r => new Date(r.departureTime).toDateString() === d.toDateString()).length;
    return { label: d.toLocaleDateString('en-IN', { weekday: 'short' })[0], value: count };
  });

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-route-500"></div></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-end -mb-2">
        <button onClick={() => navigate('/my-rides')} className="text-sm font-bold text-route-600 bg-route-50 px-4 py-2 rounded-xl hover:bg-route-100 transition-colors">
          Manage recurring rides in My Rides →
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Rides" value={stats?.todaysRidesCount ?? 0} accent="ink" />
        <StatCard label="Recurring Rides" value={stats?.recurringRidesCount ?? 0} accent="route" />
        <StatCard label="Upcoming Rides" value={stats?.upcomingRidesCount ?? upcoming.length} accent="marigold" />
        <StatCard label="Total Seats Filled" value={stats?.totalSeatsFilled ?? totalPassengers} accent="rose" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending Requests" value={stats?.rideRequests?.pending ?? 0} accent="ink" />
        <StatCard label="Accepted Requests" value={stats?.rideRequests?.accepted ?? 0} accent="route" />
        <StatCard label="Cancelled Requests" value={stats?.rideRequests?.cancelled ?? 0} accent="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-ink/10 p-6">
          <p className="text-xs font-bold uppercase text-ink/40 tracking-wide mb-1">Monthly Earnings</p>
          <p className="font-display text-3xl text-route-600">₹{stats?.monthlyEarnings ?? 0}</p>
          <p className="text-xs text-ink-600 mt-2">From bookings this calendar month</p>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ink/10 p-6">
          <p className="text-xs font-bold uppercase text-ink/40 tracking-wide mb-4">Rides published — last 7 days</p>
          <MiniBarChart data={last7Days} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">Manage your rides</h3>
          <button onClick={() => navigate('/offer-ride')} className="bg-marigold-500 hover:bg-marigold-400 text-ink text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95">
            + Offer a ride
          </button>
        </div>

        {rides.length === 0 ? (
          <div className="bg-paper border border-dashed border-ink/15 rounded-xl p-12 text-center">
            <p className="text-ink-600 font-medium">You haven't offered any rides yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {rides.map(ride => {
              const isFuture = new Date(ride.departureTime) > now;
              return (
                <div key={ride._id} className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-display text-base">
                        {ride.pickupLocation} <span className="text-ink/30 font-normal mx-1">&rarr;</span> {ride.dropoffLocation}
                      </h4>
                      <p className="text-sm text-ink-600 mt-1 font-meter">{new Date(ride.departureTime).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-ink/5 text-ink-600 text-xs font-bold px-3 py-1 rounded-full">{ride.availableSeats} seats left</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        ride.status === 'Full' ? 'bg-alert-50 text-alert-500 border-alert-400/20'
                        : isFuture ? 'bg-route-50 text-route-600 border-route-100'
                        : 'bg-ink/5 text-ink/40 border-ink/10'
                      }`}>
                        {ride.status === 'Full' ? 'Full' : isFuture ? 'Active' : 'Past'}
                      </span>
                      {isFuture && ride.passengers?.length === 0 && (
                        <button onClick={() => setEditingId(editingId === ride._id ? null : ride._id)} className="text-xs font-bold text-route-600 bg-route-50 px-3 py-1.5 rounded-lg hover:bg-route-100 transition-colors">
                          Edit
                        </button>
                      )}
                      <button onClick={() => handleDelete(ride._id)} className="text-xs font-bold text-alert-500 bg-alert-50 px-3 py-1.5 rounded-lg hover:bg-alert-400/10 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingId === ride._id && (
                    <div className="p-5 border-b border-ink/10">
                      <EditRideRow
                        ride={ride}
                        onCancel={() => setEditingId(null)}
                        onSaved={(updated) => {
                          setRides(prev => prev.map(r => r._id === updated._id ? { ...r, ...updated } : r));
                          setEditingId(null);
                        }}
                      />
                    </div>
                  )}

                  <div className="p-5 bg-paper/60">
                    <h5 className="text-xs font-bold text-ink-600 uppercase tracking-wider mb-3">
                      Passengers ({ride.passengers?.length || 0})
                    </h5>
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
                                  {pUser.phoneNumber && <span className="block text-xs text-ink/40">{pUser.phoneNumber}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {pUser.phoneNumber && (
                                  <a href={`tel:${pUser.phoneNumber}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-route-600 bg-route-50 px-3 py-2 rounded-lg hover:bg-route-100 transition-colors">
                                    Call
                                  </a>
                                )}
                                <button onClick={() => handleMessage(pUser._id, pUser.name)} className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-ink/5 px-3 py-2 rounded-lg hover:bg-ink/10 transition-colors">
                                  Message
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
