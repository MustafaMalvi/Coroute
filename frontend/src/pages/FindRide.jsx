import { useState, useEffect } from 'react';
import api from '../api';
import SearchFilter from '../components/SearchFilter';
import RideList from '../components/RideList';
import { comman } from '../styles/style';

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
            ? true
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
          <span className={comman.yellowtxt} >Live routes</span>
          <h2 className={comman.pageheading} >Find your perfect ride</h2>
          <p className={comman.pagesubh} >
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
              {grouped.todaysOneTimeRides.length > 0 ? (
                <section>
                  <h3 className={comman.heading} >📅 Today's One-Time Rides</h3>
                  <p className={comman.subh}>Single rides departing today.</p>
                  <RideList rides={grouped.todaysOneTimeRides} />
                </section>
              ) : null}
              {grouped.todaysRecurringRides.length > 0 ? (
                <section>
                  <h3 className={comman.heading}>🔁 Today's Recurring Rides</h3>
                  <p className={comman.subh}>Standing routes that run every weekday selected by the host.</p>
                  <RideList rides={grouped.todaysRecurringRides} />
                </section>
              ) : null}
              {grouped.upcomingOneTimeRides?.length > 0 ? (
                <section>
                  <h3 className={comman.heading} >Upcoming one-time rides</h3>
                  <p className={comman.subh} >One-time rides scheduled for later dates.</p>
                  <RideList rides={grouped.upcomingOneTimeRides} />
                </section>
              ) : null}
              {grouped.todaysOneTimeRides.length === 0 && grouped.todaysRecurringRides.length === 0 && grouped.upcomingOneTimeRides?.length === 0 && (
              <section>
              <h3 className={comman.heading}>No Rides Available</h3>
              <p className={comman.subh}>There are currently no rides available.</p>
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