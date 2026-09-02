import { useState, useContext, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { API_BASE_URL } from '../api';
import { toast } from 'react-toastify';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { field, heading } from '../styles/style';

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const getToday = () => new Date().toISOString().split('T')[0];

const OfferRide = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [type, setType] = useState('one-time');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState(getToday());
  const [days, setDays] = useState([]);
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);

  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [vehicleLoading, setVehicleLoading] = useState(true);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const res = await api.get('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        setVehicle(res.data.vehicle || null);
      } catch (err) {
        toast.error('Could not load your saved vehicle details.');
      } finally {
        setVehicleLoading(false);
      }
    };

    if (user) loadVehicle();
  }, [user]);

  const earnings = useMemo(() => {
    return (Number(seats) || 0) * (Number(price) || 0);
  }, [seats, price]);

  const toggleDay = day => {
    setDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const submitRide = async e => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('You must be logged in to offer a ride!');
      navigate('/login');
      return;
    }

    if (!vehicle?.number) {
      toast.error('Please add your vehicle details in your profile before publishing a ride.');
      navigate('/profile');
      return;
    }

    if (type === 'recurring' && days.length === 0) {
      toast.error('Select at least one weekday for a recurring ride.');
      return;
    }

    if (type === 'one-time' && !date) {
      toast.error('Ride date is required for a one-time ride.');
      return;
    }

    setLoading(true);

    const ride = {
      rideType: type,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      rideDate: type === 'one-time' ? date : undefined,
      repeatDays: type === 'recurring' ? days : [],
      departureTimeStr: time,
      availableSeats: Number(seats),
      pricePerSeat: Number(price),
      notes,
      womenOnly
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(ride)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Failed to publish ride. Please try again.'
        );
      }

      toast.success(
        `Ride published! ${pickup} → ${dropoff} is now live.`
      );

      navigate('/my-rides');
    } catch (err) {
      console.error('Error creating ride:', err);

      toast.error(
        err.message || 'Cannot connect to the server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-paper pb-20">

      {/* Header */}
      <div className="livery-bg relative overflow-hidden pt-16 pb-28 px-4">

        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-6 right-16 w-72 h-72 bg-marigold-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-route-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="font-meter text-xs tracking-[0.2em] uppercase text-marigold-500">
            Publish a route
          </span>

          <h2 className="font-display text-3xl md:text-4xl text-paper mt-3">
            Turn empty seats into earnings
          </h2>

          <p className="text-paper/60 mt-3 max-w-xl mx-auto">
            Set your route, price, and schedule. Verified student partners
            will book seats in minutes.
          </p>
        </div>

      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative grid lg:grid-cols-5 gap-6">

        {/* Form */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-ticket border border-ink/10 p-6 sm:p-8">

          <form onSubmit={submitRide} className="space-y-5">

            {/* Ride type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-2">
                Ride type
              </label>

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() => setType('one-time')}
                  className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                    type === 'one-time'
                      ? 'border-marigold-500 bg-marigold-500/10'
                      : 'border-ink/10 bg-paper hover:border-ink/20'
                  }`}
                >
                  <p className={`text-sm font-bold ${
                    type === 'one-time'
                      ? 'text-ink'
                      : 'text-ink-600'
                  }`}>
                    One-Time Ride
                  </p>

                  <p className="text-[11px] text-ink/40 mt-0.5">
                    A single ride on a specific date
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setType('recurring')}
                  className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                    type === 'recurring'
                      ? 'border-marigold-500 bg-marigold-500/10'
                      : 'border-ink/10 bg-paper hover:border-ink/20'
                  }`}
                >
                  <p className={`text-sm font-bold ${
                    type === 'recurring'
                      ? 'text-ink'
                      : 'text-ink-600'
                  }`}>
                    Recurring Ride
                  </p>

                  <p className="text-[11px] text-ink/40 mt-0.5">
                    Repeats every selected weekday
                  </p>
                </button>

              </div>
            </div>

            {/* Locations */}
            <div className="space-y-4">

              <div>
                <label className={field.label}>
                  Pickup location
                </label>

                <LocationAutocomplete
                  value={pickup}
                  onChange={setPickup}
                  placeholder="e.g., Trikon Baug"
                  dotColor="text-route-500"
                  inputBgClass="bg-paper"
                  required
                />
              </div>

              <div>
                <label className={field.label}>
                  Dropoff location
                </label>

                <LocationAutocomplete
                  value={dropoff}
                  onChange={setDropoff}
                  placeholder="e.g., MU Hostel"
                  dotColor="text-alert-400"
                  inputBgClass="bg-paper"
                  required
                />
              </div>

            </div>

            {/* Date / Days */}
            {type === 'one-time' ? (
              <div>
                <label className={field.label}>
                  Ride date
                </label>

                <input
                  type="date"
                  min={getToday()}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={field.inputLg}
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-2">
                  Repeat on
                </label>

                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                        days.includes(day)
                          ? 'bg-ink text-marigold-500 border-ink'
                          : 'bg-paper text-ink-600 border-ink/15 hover:border-ink/30'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-ink/40 mt-2">
                  {days.length
                    ? `Available every ${days.join(', ')}.`
                    : 'Select the weekdays this ride repeats on.'}
                </p>
              </div>
            )}

            {/* Time and seats */}
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className={field.label}>
                  Departure time
                </label>

                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className={field.inputLg}
                  required
                />
              </div>

              <div>
                <label className={field.label}>
                  Available seats
                </label>

                <input
                  type="number"
                  min="1"
                  max="4"
                  placeholder="1-4"
                  value={seats}
                  onChange={e => setSeats(e.target.value)}
                  className={field.inputLg}
                  required
                />
              </div>

            </div>

            {/* Price */}
            <div>
              <label className={field.label}>
                Price per seat (₹)
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40 font-meter">
                  ₹
                </span>

                <input
                  type="number"
                  min="10"
                  placeholder="30"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="pl-8 w-full py-3 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={field.label}>
                Notes{' '}
                <span className="text-ink/35 font-normal normal-case">
                  (not required)
                </span>
              </label>

              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value.slice(0, 300))}
                rows={2}
                placeholder="e.g., Meet near the main gate, AC vehicle"
                className="w-full py-3 px-3 bg-paper border border-ink/15 rounded-xl focus:ring-2 focus:ring-route-500 focus:border-route-500 outline-none transition-all resize-none placeholder-ink/35"
              />
            </div>

            {/* Vehicle */}
            <div className="pt-2 border-t border-ink/10">

              <label className={field.labelSpaced}>
                Vehicle
              </label>

              {vehicleLoading ? (
                <div className="h-14 rounded-xl bg-ink/5 animate-pulse" />
              ) : vehicle?.number ? (
                <div className="flex items-center justify-between bg-route-50 border border-route-100 rounded-xl p-3.5">

                  <div>
                    <p className="font-semibold text-ink text-sm">
                      {vehicle.model || vehicle.type || 'Vehicle'}
                      {vehicle.color ? ` · ${vehicle.color}` : ''}
                    </p>

                    <p className="text-xs text-ink-600 font-meter mt-0.5">
                      {vehicle.number}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="text-xs font-bold text-route-600 hover:underline"
                  >
                    Edit in profile
                  </button>

                </div>
              ) : (
                <div className="flex items-center justify-between bg-alert-50 border border-alert-400/20 rounded-xl p-3.5">

                  <p className="text-xs text-alert-500 font-medium">
                    No vehicle on file yet. Add it in your profile.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="text-xs font-bold text-alert-500 hover:underline flex-shrink-0 ml-3"
                  >
                    Add now
                  </button>

                </div>
              )}

            </div>

            {/* Women only */}
            {user?.gender === 'Female' && (
              <div className="flex items-center gap-3 bg-rose-50 p-4 rounded-xl border border-rose-100">

                <input
                  type="checkbox"
                  id="womenOnly"
                  checked={womenOnly}
                  onChange={e => setWomenOnly(e.target.checked)}
                  className="w-5 h-5 text-rose-500 bg-white border-rose-300 rounded focus:ring-rose-400 focus:ring-2"
                />

                <label
                  htmlFor="womenOnly"
                  className="text-sm font-semibold text-rose-500"
                >
                  Women-only ride

                  <span className="block font-normal text-xs text-rose-400 mt-0.5">
                    Only female students can book this ride.
                  </span>
                </label>

              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || vehicleLoading || !vehicle?.number}
              className="w-full flex justify-center items-center py-3.5 px-4 mt-6 bg-marigold-500 hover:bg-marigold-400 text-ink rounded-xl font-bold text-base active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-marigold-500/20"
            >
              {loading ? 'Publishing...' : 'Publish ride'}
            </button>

          </form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">

          <div className="bg-ink rounded-2xl p-6 text-paper sticky top-24">

            <span className="font-meter text-[11px] tracking-widest text-marigold-500 uppercase">
              Route preview
            </span>

            <div className="mt-3">
              <span className="text-[10px] font-bold uppercase tracking-wide bg-paper/10 text-paper/70 px-2.5 py-1 rounded-full">
                {type === 'recurring'
                  ? 'Recurring'
                  : 'One-Time'}
              </span>
            </div>

            {/* Route */}
            <div className="mt-4 relative pl-6">

              <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-paper/20" />

              <div className="relative mb-5">

                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-route-400" />

                <p className="text-[10px] uppercase tracking-wide text-paper/40">
                  Pickup
                </p>

                <p className={heading.card}>
                  {pickup || 'Your pickup point'}
                </p>

              </div>

              <div className="relative">

                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-alert-400" />

                <p className="text-[10px] uppercase tracking-wide text-paper/40">
                  Dropoff
                </p>

                <p className={heading.card}>
                  {dropoff || 'Your destination'}
                </p>

              </div>

            </div>

            {/* Date */}
            <div className="mt-6 pt-5 border-t border-paper/10 flex items-center justify-between text-sm">

              <span className="text-paper/50">
                {type === 'recurring'
                  ? 'Repeats'
                  : 'Ride date'}
              </span>

              <span className="font-meter font-semibold text-right">
                {type === 'recurring'
                  ? (
                    days.length
                      ? days.map(d => d.slice(0, 3)).join(' • ')
                      : '—'
                  )
                  : (
                    date
                      ? new Date(date).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }
                        )
                      : '—'
                  )}
              </span>

            </div>

            {/* Time */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-paper/50">
                Departure
              </span>

              <span className="font-meter font-semibold">
                {time || '--:--'}
              </span>
            </div>

            {/* Seats */}
            <div className="mt-3 flex items-center justify-between text-sm">

              <span className="text-paper/50">
                Seats available
              </span>

              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <span
                    key={i}
                    className={`w-4 h-4 rounded-md ${
                      i <= Number(seats || 0)
                        ? 'bg-marigold-500'
                        : 'bg-paper/10'
                    }`}
                  />
                ))}
              </div>

            </div>

            {/* Earnings */}
            <div className="mt-5 bg-marigold-500/10 border border-marigold-500/20 rounded-xl p-4">

              <p className="text-[11px] uppercase tracking-wide text-marigold-400 font-bold">
                Estimated earnings
              </p>

              <p className="font-display text-3xl text-marigold-500 mt-1">
                ₹{earnings}
              </p>

              <p className="text-[11px] text-paper/40 mt-1">
                {type === 'recurring' ? 'Per day, ' : ''}
                if all {seats || 0} seat(s) get booked at ₹{price || 0} each
              </p>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OfferRide;