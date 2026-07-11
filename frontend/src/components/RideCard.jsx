import { useContext, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WEEKDAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };

const BookingTypeModal = ({ onClose, onConfirm, submitting }) => {
  const [choice, setChoice] = useState('single');
  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-ink/10 p-6 w-full max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-1">What would you like to book?</h3>
        <p className="text-ink-600 text-sm mb-4">This is a recurring ride — choose how you'd like to book it.</p>
        <div className="space-y-2.5">
          <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${choice === 'single' ? 'border-route-500 bg-route-50' : 'border-ink/10'}`}>
            <input type="radio" name="bookingType" checked={choice === 'single'} onChange={() => setChoice('single')} className="mt-1" />
            <span>
              <span className="block font-bold text-sm text-ink">Only this ride</span>
              <span className="block text-xs text-ink-600">Book a seat for just the next occurrence.</span>
            </span>
          </label>
          <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${choice === 'recurring' ? 'border-route-500 bg-route-50' : 'border-ink/10'}`}>
            <input type="radio" name="bookingType" checked={choice === 'recurring'} onChange={() => setChoice('recurring')} className="mt-1" />
            <span>
              <span className="block font-bold text-sm text-ink">Recurring booking</span>
              <span className="block text-xs text-ink-600">Automatically book every occurrence until you cancel.</span>
            </span>
          </label>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 bg-ink/5 hover:bg-ink/10 text-ink font-semibold py-2.5 rounded-xl transition-all">Cancel</button>
          <button onClick={() => onConfirm(choice)} disabled={submitting} className="flex-1 bg-marigold-500 hover:bg-marigold-400 text-ink font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">
            {submitting ? 'Booking...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RideCard = ({ ride, onRideUpdate }) => {
  const { user } = useContext(AuthContext);
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [localSeats, setLocalSeats] = useState(ride.availableSeats);
  const [booked, setBooked] = useState(() => {
    if (!user) return false;
    return ride.passengers?.some(p => {
      const passengerId = p.userId?._id || p.userId;
      return passengerId === user.id || passengerId?.toString() === user.id;
    }) || false;
  });
  const navigate = useNavigate();

  const driverName = ride.creator?.name || 'Student';
  const driverPhone = ride.creator?.phoneNumber || '';
  const isMyRide = user && (user.id === ride.creator?._id);
  const isHost = user?.role === 'host';
  const isRecurring = ride.rideType === 'recurring';
  const totalSeats = localSeats + (ride.passengers?.length || 0);

  const doBook = async (bookingType) => {
    try {
      setIsBooking(true);
      const res = await api.post(`/api/rides/${ride._id}/book`, { bookingType }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      toast.success(res.data.message || 'Seat booked successfully!');
      setLocalSeats(res.data.ride.availableSeats);
      setBooked(true);
      setShowTypeModal(false);
      if (onRideUpdate) onRideUpdate();

      const wantToChat = window.confirm('Seat booked! 🎉 Would you like to message the driver to coordinate?');
      if (wantToChat) {
        navigate(`/chat/${ride.creator._id}`, { state: { partnerName: driverName } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error booking seat');
    } finally {
      setIsBooking(false);
    }
  };

  const handleBookSeat = async () => {
    if (!user) {
      toast.error('Please login to book a seat!');
      return;
    }
    if (ride.womenOnly && user.gender !== 'Female') {
      toast.error('This ride is exclusively for women.');
      return;
    }

    if (isRecurring) {
      setShowTypeModal(true);
      return;
    }
    doBook('single');
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Cancel your booking for this ride?')) return;
    try {
      setIsCancelling(true);
      await api.post(`/api/rides/${ride._id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Booking cancelled.');
      setLocalSeats(prev => prev + 1);
      setBooked(false);
      if (onRideUpdate) onRideUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleMessageClick = () => {
    if (!user) {
      toast.error('Please log in to message the driver.');
      navigate('/login');
      return;
    }
    navigate(`/chat/${ride.creator._id}`, { state: { partnerName: driverName } });
  };

  return (
    <div
      className={`ride-ticket rounded-2xl shadow-sm hover:shadow-ticket transition-all duration-200 flex flex-col sm:flex-row ${
        ride.womenOnly ? 'bg-rose-50 border border-rose-100' : 'bg-white border border-ink/10'
      }`}
      style={{ '--notch-color': ride.womenOnly ? '#FDF0F3' : '#FBF6EA' }}
    >
      <div className="flex-1 p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <h3 className="text-xl font-display leading-none">
            {ride.pickupLocation} <span className="text-ink/30 mx-1">&rarr;</span> {ride.dropoffLocation}
          </h3>
          {isMyRide && <span className="bg-ink/5 text-ink/50 text-[11px] px-2 py-0.5 rounded-full font-bold uppercase">Your Ride</span>}
          {booked && !isMyRide && <span className="bg-route-100 text-route-600 text-[11px] px-2 py-0.5 rounded-full font-bold uppercase">✓ Booked</span>}
          {ride.womenOnly && <span className="bg-rose-100 text-rose-500 border border-rose-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase">🚺 Women Only</span>}
        </div>

        {/* Ride type indicator — one-time date vs recurring weekday chips */}
        <div className="mb-3">
          {isRecurring ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-route-600 bg-route-50 border border-route-100 px-2.5 py-1 rounded-full">
                🔁 Recurring Ride
              </span>
              <span className="text-xs text-ink-600">
                Every {ride.repeatDays?.map(d => WEEKDAY_SHORT[d] || d).join(' • ')}
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-marigold-600 bg-marigold-500/10 border border-marigold-500/20 px-2.5 py-1 rounded-full">
              📅 {new Date(ride.departureTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-600">
          <span className="flex items-center gap-1.5 font-meter font-medium">
            <svg className="w-4 h-4 text-ink/35" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {new Date(ride.nextDeparture || ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="bg-ink/5 px-2.5 py-1 rounded-full font-medium">
            {localSeats} / {totalSeats} seats
          </span>
          <span className="font-medium">Driver: {driverName}</span>
        </div>

        {(ride.vehicleModel || ride.vehicleNumber) && (
          <div className="mt-2 text-xs text-ink/50 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 13l1.5-4.5A2 2 0 016.4 7h11.2a2 2 0 011.9 1.5L21 13v6a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" /></svg>
            {[ride.vehicleModel, ride.vehicleColor, ride.vehicleNumber].filter(Boolean).join(' · ')}
          </div>
        )}

        {ride.notes && (
          <p className="mt-2 text-xs text-ink-600 italic bg-paper/60 border border-ink/10 rounded-lg px-3 py-2 max-w-md">"{ride.notes}"</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {driverPhone && !isMyRide && (
            <a href={`tel:${driverPhone}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-route-600 bg-route-50 px-3 py-1.5 rounded-lg hover:bg-route-100 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              Call Driver
            </a>
          )}
          {!isMyRide && ride.creator?._id && (
            <button onClick={handleMessageClick} className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-ink/5 px-3 py-1.5 rounded-lg hover:bg-ink/10 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
              Message
            </button>
          )}
        </div>
      </div>

      <div className="ride-ticket-perforation sm:border-l-0 border-t sm:border-t-0 border-dashed border-ink/15 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 p-6 sm:w-44">
        <div className="meter-chip px-3 py-1.5 text-xl">₹{ride.pricePerSeat || 0}</div>
        {booked && !isMyRide ? (
          <button
            onClick={handleCancelBooking}
            disabled={isCancelling}
            className="bg-white border-2 border-route-500 text-route-600 font-bold py-2 px-5 rounded-xl hover:bg-route-50 transition-all active:scale-95 disabled:opacity-50 text-sm"
          >
            {isCancelling ? 'Cancelling...' : '✓ Booked — Cancel'}
          </button>
        ) : isHost && !isMyRide ? (
          <span className="text-[11px] text-ink/35 font-medium text-center max-w-[9rem]">Hosts can't book rides</span>
        ) : (
          <button
            onClick={handleBookSeat}
            disabled={isBooking || localSeats === 0 || isMyRide}
            className="bg-ink hover:bg-ink-700 text-marigold-500 font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isMyRide ? 'Your Ride' : (isBooking ? 'Booking...' : (localSeats === 0 ? 'Full' : 'Book Seat'))}
          </button>
        )}
      </div>

      {showTypeModal && (
        <BookingTypeModal
          onClose={() => setShowTypeModal(false)}
          onConfirm={(choice) => doBook(choice)}
          submitting={isBooking}
        />
      )}
    </div>
  );
};

export default RideCard;
