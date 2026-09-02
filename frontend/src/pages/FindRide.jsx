import { useState, useEffect } from 'react';
import api from '../api';
import SearchFilter from '../components/SearchFilter';
import RideList from '../components/RideList';
import { comman } from '../styles/style';

const FindRide = () => {
  const [rides, setRides] = useState({
    todaysOneTimeRides: [],
    todaysRecurringRides: [],
    upcomingOneTimeRides: [],
    all: []
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRides = async () => {
      try {
        const res = await api.get('/api/rides');
        setRides(res.data);
      } catch (err) {
        console.error('Failed to fetch rides', err);
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, []);

  const handleSearch = ({ pickup, dropoff, date, minSeats }) => {
    const list = rides.all.filter(ride => {
      const from = pickup
        ? ride.pickupLocation.toLowerCase().includes(pickup.toLowerCase())
        : true;

      const to = dropoff
        ? ride.dropoffLocation.toLowerCase().includes(dropoff.toLowerCase())
        : true;

      const day = date
        ? ride.rideType === 'recurring' ||
          new Date(ride.departureTime).toDateString() ===
            new Date(date).toDateString()
        : true;

      const seats = minSeats
        ? ride.availableSeats >= minSeats
        : true;

      return from && to && day && seats;
    });

    setResults(list);
  };

  const hasToday =
    rides.todaysOneTimeRides.length > 0 ||
    rides.todaysRecurringRides.length > 0;

  const hasUpcoming =
    rides.upcomingOneTimeRides?.length > 0;

  if (loading) {
    return (
      <div className="flex-1 bg-paper pb-20">
        <div className="max-w-4xl mx-auto px-4 pt-10">
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl border border-ink/10 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-paper pb-20">

      <div className="livery-bg pt-16 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-marigold-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-72 h-72 bg-route-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <span className={comman.yellowtxt}>
            Live routes
          </span>

          <h2 className={comman.pageheading}>
            Find your perfect ride
          </h2>

          <p className={comman.pagesubh}>
            Discover verified ride hosts travelling on your route.
            Book a seat quickly, travel safely, and save money.
          </p>
        </div>
      </div>

      <div className="px-4">
        <SearchFilter onSearch={handleSearch} />

        <div className="max-w-4xl mx-auto">

          {results !== null ? (
            <RideList
              rides={results}
              showSearchEmptyState
            />
          ) : (
            <div className="mt-10 space-y-10">

              {rides.todaysOneTimeRides.length > 0 && (
                <section>
                  <h3 className={comman.heading}>
                    Today's One-Time Rides
                  </h3>

                  <p className={comman.subh}>
                    Single rides departing today.
                  </p>

                  <RideList rides={rides.todaysOneTimeRides} />
                </section>
              )}

              {rides.todaysRecurringRides.length > 0 && (
                <section>
                  <h3 className={comman.heading}>
                    Today's Recurring Rides
                  </h3>

                  <p className={comman.subh}>
                    Standing routes that run every weekday selected
                    by the host.
                  </p>

                  <RideList rides={rides.todaysRecurringRides} />
                </section>
              )}

              {rides.upcomingOneTimeRides?.length > 0 && (
                <section>
                  <h3 className={comman.heading}>
                    Upcoming One-Time Rides
                  </h3>

                  <p className={comman.subh}>
                    One-time rides scheduled for later dates.
                  </p>

                  <RideList rides={rides.upcomingOneTimeRides} />
                </section>
              )}

              {!hasToday && !hasUpcoming && (
                <section>
                  <h3 className={comman.heading}>
                    No Rides Available
                  </h3>

                  <p className={comman.subh}>
                    There are currently no rides available.
                  </p>
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