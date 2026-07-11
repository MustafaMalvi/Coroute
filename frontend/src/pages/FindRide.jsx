import { useState, useEffect } from 'react';
import api from '../api';
import SearchFilter from '../components/SearchFilter';
import RideList from '../components/RideList';

const FindRide = () => {
  const [grouped, setGrouped] = useState({ todaysOneTimeRides: [], todaysRecurringRides: [], upcomingOneTimeRides: [], all: [] });
  const [filteredRides, setFilteredRides] = useState(null); // null = no search applied yet
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await api.get('/api/rides');
        setGrouped(res.data);
      } catch (err) {
        console.error('Failed to fetch rides', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const handleSearch = ({ pickup, dropoff, date, minSeats }) => {
    setHasSearched(true);
    const results = grouped.all.filter(ride => {
      const matchPickup = pickup ? ride.pickupLocation.toLowerCase().includes(pickup.toLowerCase()) : true;
      const matchDropoff = dropoff ? ride.dropoffLocation.toLowerCase().includes(dropoff.toLowerCase()) : true;
      const matchDate = date
        ? (ride.rideType === 'recurring'
            ? true // recurring rides don't have a fixed date — match on weekday would need the picked date
            : new Date(ride.departureTime).toDateString() === new Date(date).toDateString())
        : true;
      const matchSeats = minSeats ? ride.availableSeats >= minSeats : true;
      return matchPickup && matchDropoff && matchDate && matchSeats;
    });
    setFilteredRides(results);
  };

  return (
    <div className="flex-1 bg-paper pb-20">
      <div className="livery-bg pt-16 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-marigold-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-72 h-72 bg-route-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="font-meter text-xs tracking-[0.2em] uppercase text-marigold-500">Live routes</span>
          <h2 className="font-display text-3xl md:text-4xl text-paper mt-3">Find your perfect ride</h2>
          <p className="text-paper/60 mt-3 max-w-xl mx-auto">
            Discover verified ride hosts travelling on your route. Book a seat quickly, travel safely, and save money.
          </p>
        </div>
      </div>

      <div className="px-4">
        <SearchFilter onSearch={handleSearch} />
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col gap-4 mt-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white rounded-2xl border border-ink/10 animate-pulse"></div>
              ))}
            </div>
          ) : filteredRides !== null ? (
            <RideList rides={filteredRides} showSearchEmptyState={hasSearched} />
          ) : (
            <div className="mt-10 space-y-10">
              <section>
                <h3 className="font-display text-xl mb-1 flex items-center gap-2">📅 Today's One-Time Rides</h3>
                <p className="text-ink-600 text-sm mb-4">Single rides departing today.</p>
                <RideList rides={grouped.todaysOneTimeRides} />
              </section>
              <section>
                <h3 className="font-display text-xl mb-1 flex items-center gap-2">🔁 Today's Recurring Rides</h3>
                <p className="text-ink-600 text-sm mb-4">Standing routes that run every weekday selected by the host.</p>
                <RideList rides={grouped.todaysRecurringRides} />
              </section>
              {grouped.upcomingOneTimeRides?.length > 0 && (
                <section>
                  <h3 className="font-display text-xl mb-1">Upcoming one-time rides</h3>
                  <p className="text-ink-600 text-sm mb-4">One-time rides scheduled for later dates.</p>
                  <RideList rides={grouped.upcomingOneTimeRides} />
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindRide;
