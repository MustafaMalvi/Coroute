const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ──────────── Helpers ────────────

const dateKey = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const WEEKDAYS_SUN_FIRST = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weekdayOf = (d) => WEEKDAYS_SUN_FIRST[new Date(d).getDay()];

const occursOn = (ride, date) => {
  if (ride.rideType !== 'recurring') return false;
  if (ride.isPaused) return false;
  if (ride.status === 'Cancelled') return false;
  if (!ride.repeatDays.includes(weekdayOf(date))) return false;
  if (ride.skipDates?.includes(dateKey(date))) return false;
  return true;
};

const effectiveDeparture = (ride, date) => {
  const base = new Date(date);
  const override = ride.dateOverrides?.get ? ride.dateOverrides.get(dateKey(date)) : ride.dateOverrides?.[dateKey(date)];
  const dep = new Date(ride.departureTime);
  const timeSource = override ? override : `${String(dep.getHours()).padStart(2, '0')}:${String(dep.getMinutes()).padStart(2, '0')}`;
  const [hh, mm] = timeSource.split(':').map(Number);
  base.setHours(hh, mm, 0, 0);
  return base;
};

const serializeRide = (rideDoc, forDate) => {
  const ride = rideDoc.toObject ? rideDoc.toObject() : rideDoc;
  if (ride.rideType === 'recurring') {
    const refDate = forDate || new Date();
    ride.nextDeparture = effectiveDeparture(ride, refDate);
    ride.occursToday = occursOn(ride, new Date());
  } else {
    ride.nextDeparture = ride.departureTime;
  }
  return ride;
};

const validateRideInput = (body) => {
  const {
    rideType, pickupLocation, dropoffLocation, rideDate, repeatDays,
    departureTimeStr, availableSeats, pricePerSeat
  } = body;

  if (!pickupLocation || typeof pickupLocation !== 'string' || pickupLocation.trim().length < 2) {
    return 'Pickup location must be at least 2 characters.';
  }
  if (!dropoffLocation || typeof dropoffLocation !== 'string' || dropoffLocation.trim().length < 2) {
    return 'Dropoff location must be at least 2 characters.';
  }
  if (!departureTimeStr || !/^\d{2}:\d{2}$/.test(departureTimeStr)) {
    return 'A valid departure time is required.';
  }

  const seats = Number(availableSeats);
  if (!Number.isInteger(seats) || seats < 1 || seats > 4) {
    return 'Available seats must be between 1 and 4.';
  }

  const price = Number(pricePerSeat);
  if (isNaN(price) || price < 0) {
    return 'Price per seat must be a non-negative number.';
  }

  const type = rideType === 'recurring' ? 'recurring' : 'one-time';

  if (type === 'one-time') {
    if (!rideDate) return 'Ride date is required for a one-time ride.';
    if (Array.isArray(repeatDays) && repeatDays.length > 0) return 'Repeat days must be empty for a one-time ride.';
  } else {
    if (rideDate) return 'Ride date must not be set for a recurring ride.';
    if (!Array.isArray(repeatDays) || repeatDays.length === 0) return 'Select at least one weekday for a recurring ride.';
    if (repeatDays.some(d => !WEEKDAYS.includes(d))) return 'Invalid weekday selected.';
  }

  return null;
};

// GET /api/rides
router.get('/', async (req, res, next) => {
  try {
    const now = new Date();

    const oneTimeRides = await Ride.find({
      rideType: 'one-time',
      status: { $nin: ['Cancelled'] },
      departureTime: { $gte: now },
      availableSeats: { $gt: 0 }
    })
      .sort({ departureTime: 1 })
      .populate('creator', 'name phoneNumber rating')
      .populate('passengers.userId', 'name');

    const recurringRides = await Ride.find({
      rideType: 'recurring',
      isPaused: false,
      status: { $nin: ['Cancelled'] },
      availableSeats: { $gt: 0 }
    })
      .populate('creator', 'name phoneNumber rating')
      .populate('passengers.userId', 'name');

    const todaysRecurring = recurringRides
      .filter(r => occursOn(r, now))
      .map(r => serializeRide(r, now));

    const todaysOneTime = oneTimeRides
      .filter(r => dateKey(r.departureTime) === dateKey(now))
      .map(r => serializeRide(r));

    const upcomingOneTime = oneTimeRides
      .filter(r => dateKey(r.departureTime) !== dateKey(now))
      .map(r => serializeRide(r));

    res.json({
      all: [...todaysOneTime, ...todaysRecurring, ...upcomingOneTime],
      todaysOneTimeRides: todaysOneTime,
      todaysRecurringRides: todaysRecurring,
      upcomingOneTimeRides: upcomingOneTime
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/rides/my-rides
router.get('/my-rides', auth, async (req, res, next) => {
  try {
    const rides = await Ride.find({ creator: req.user.userId })
      .sort({ departureTime: -1 })
      .populate('passengers.userId', 'name phoneNumber');

    const now = new Date();
    const upcomingOneTime = [];
    const recurring = [];
    const completed = [];
    const cancelled = [];

    rides.forEach(rideDoc => {
      const ride = serializeRide(rideDoc, now);
      if (ride.status === 'Cancelled') {
        cancelled.push(ride);
      } else if (ride.rideType === 'recurring') {
        recurring.push(ride);
      } else if (new Date(ride.departureTime) > now) {
        upcomingOneTime.push(ride);
      } else {
        completed.push(ride);
      }
    });

    res.json({ upcomingOneTime, recurring, completed, cancelled, all: rides.map(r => serializeRide(r, now)) });
  } catch (err) {
    next(err);
  }
});

// GET /api/rides/dashboard/stats
router.get('/dashboard/stats', auth, async (req, res, next) => {
  try {
    if (req.user.role === 'host') {
      const rides = await Ride.find({ creator: req.user.userId }).populate('passengers.userId', 'name');
      const now = new Date();
      const today = dateKey(now);

      const todaysRides = rides.filter(r =>
        r.rideType === 'one-time' ? dateKey(r.departureTime) === today : occursOn(r, now)
      );
      const recurringRides = rides.filter(r => r.rideType === 'recurring');
      const upcomingRides = rides.filter(r =>
        r.status !== 'Cancelled' && (r.rideType === 'recurring' || new Date(r.departureTime) > now)
      );

      const totalSeatsFilled = rides.reduce((sum, r) => sum + (r.passengers?.length || 0), 0);
      const totalPassengers = totalSeatsFilled;

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const rideIds = rides.map(r => r._id);
      const bookings = await Booking.find({ ride: { $in: rideIds }, bookingStatus: { $in: ['active', 'completed'] } });
      const rideMap = new Map(rides.map(r => [r._id.toString(), r]));
      const monthlyEarnings = bookings
        .filter(b => b.createdAt >= startOfMonth)
        .reduce((sum, b) => sum + (rideMap.get(b.ride.toString())?.pricePerSeat || 0), 0);

      const pendingRequests = 0;
      const acceptedRequests = bookings.filter(b => b.bookingStatus === 'active').length;
      const cancelledRequests = await Booking.countDocuments({ ride: { $in: rideIds }, bookingStatus: 'cancelled' });

      return res.json({
        role: 'host',
        todaysRidesCount: todaysRides.length,
        recurringRidesCount: recurringRides.length,
        upcomingRidesCount: upcomingRides.length,
        totalPassengers,
        totalSeatsFilled,
        monthlyEarnings,
        rideRequests: { pending: pendingRequests, accepted: acceptedRequests, cancelled: cancelledRequests }
      });
    } else {
      const bookings = await Booking.find({ passenger: req.user.userId }).populate('ride');
      const now = new Date();
      const validBookings = bookings.filter(b => b.ride);

      const booked = validBookings.length;
      const recurringBookings = validBookings.filter(b => b.bookingType === 'recurring' && b.bookingStatus !== 'cancelled');
      const upcoming = validBookings.filter(b => {
        if (b.bookingStatus === 'cancelled') return false;
        if (b.ride.rideType === 'recurring') return true;
        return new Date(b.ride.departureTime) > now;
      });
      const completed = validBookings.filter(b => b.bookingType === 'single' && b.ride.rideType === 'one-time' && new Date(b.ride.departureTime) <= now);

      return res.json({
        role: 'partner',
        bookedRidesCount: booked,
        recurringBookingsCount: recurringBookings.length,
        upcomingTripsCount: upcoming.length,
        completedTripsCount: completed.length
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/rides
router.post('/', auth, requireRole('host'), async (req, res, next) => {
  try {
    const host = await User.findById(req.user.userId);
    if (!host) return res.status(404).json({ message: 'Host not found.' });
    if (!host.vehicle?.number) {
      return res.status(400).json({ message: 'Please add your vehicle details in your profile before publishing a ride.' });
    }

    const validationError = validateRideInput(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const {
      pickupLocation, dropoffLocation, rideType, rideDate, repeatDays,
      departureTimeStr, availableSeats, pricePerSeat, notes, womenOnly
    } = req.body;

    const type = rideType === 'recurring' ? 'recurring' : 'one-time';
    const [hh, mm] = departureTimeStr.split(':').map(Number);

    let departureTime;
    if (type === 'one-time') {
      departureTime = new Date(rideDate);
      departureTime.setHours(hh, mm, 0, 0);
      if (isNaN(departureTime.getTime()) || departureTime <= new Date()) {
        return res.status(400).json({ message: 'Departure time must be a valid future date & time.' });
      }
    } else {
      departureTime = new Date();
      departureTime.setHours(hh, mm, 0, 0);
    }

    if (womenOnly && host.gender !== 'Female') {
      return res.status(403).json({ message: 'Only female users can create women-only rides.' });
    }

    const seats = Number(availableSeats);

    const newRide = new Ride({
      creator: host._id,
      pickupLocation: pickupLocation.trim(),
      dropoffLocation: dropoffLocation.trim(),
      rideType: type,
      rideDate: type === 'one-time' ? new Date(rideDate) : null,
      repeatDays: type === 'recurring' ? repeatDays : [],
      departureTime,
      availableSeats: seats,
      totalSeats: seats,
      pricePerSeat: Number(pricePerSeat),
      notes: (notes || '').trim().slice(0, 300),
      womenOnly: !!womenOnly,
      vehicleId: host._id,
      vehicleNumber: host.vehicle.number,
      vehicleType: host.vehicle.type,
      vehicleModel: host.vehicle.model,
      vehicleColor: host.vehicle.color,
      passengers: []
    });

    await newRide.save();
    res.status(201).json(newRide);
  } catch (err) {
    next(err);
  }
});

// POST /api/rides/:id/book
router.post('/:id/book', auth, requireRole('partner'), async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const userId = req.user.userId;
    const bookingType = req.body.bookingType === 'recurring' ? 'recurring' : 'single';

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.status === 'Cancelled' || ride.isPaused) {
      return res.status(400).json({ message: 'This ride is not currently available for booking.' });
    }
    if (ride.rideType === 'one-time' && bookingType === 'recurring') {
      return res.status(400).json({ message: 'Recurring bookings are only available for recurring rides.' });
    }

    if (ride.creator.toString() === userId) {
      return res.status(400).json({ message: 'You cannot book your own ride.' });
    }

    const existingBooking = await Booking.findOne({ ride: rideId, passenger: userId, bookingStatus: { $in: ['active', 'paused'] } });
    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this ride.' });
    }

    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: 'No seats available for this ride.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (ride.womenOnly && user.gender !== 'Female') {
      return res.status(403).json({ message: 'This ride is only for women and you cannot book it.' });
    }

    ride.availableSeats -= 1;
    ride.passengers.push({ userId, bookingType });
    if (ride.availableSeats === 0) ride.status = 'Full';
    await ride.save();

    const booking = new Booking({
      ride: rideId,
      passenger: userId,
      bookingType,
      bookingStatus: 'active'
    });
    await booking.save();

    const alreadyInHistory = user.bookedRides.find(r => r.rideId.toString() === rideId);
    if (!alreadyInHistory) {
      user.bookedRides.push({ rideId });
      await user.save();
    }

    res.status(200).json({
      message: bookingType === 'recurring' ? 'Recurring booking confirmed!' : 'Seat booked successfully!',
      ride: { _id: ride._id, availableSeats: ride.availableSeats, status: ride.status, creator: ride.creator },
      booking
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/rides/:id
router.put('/:id', auth, requireRole('host'), async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own rides.' });
    }

    const { pickupLocation, dropoffLocation, departureTimeStr, availableSeats, pricePerSeat, womenOnly, notes, rideDate } = req.body;

    if (ride.passengers.length > 0 && (pickupLocation || dropoffLocation)) {
      return res.status(400).json({ message: 'Cannot change route of a ride that already has bookings.' });
    }

    if (pickupLocation) ride.pickupLocation = pickupLocation.trim();
    if (dropoffLocation) ride.dropoffLocation = dropoffLocation.trim();

    if (departureTimeStr) {
      if (!/^\d{2}:\d{2}$/.test(departureTimeStr)) {
        return res.status(400).json({ message: 'Invalid departure time.' });
      }
      const [hh, mm] = departureTimeStr.split(':').map(Number);
      if (ride.rideType === 'recurring') {
        const newTime = new Date(ride.departureTime);
        newTime.setHours(hh, mm, 0, 0);
        ride.departureTime = newTime;
      } else {
        const base = rideDate ? new Date(rideDate) : new Date(ride.departureTime);
        base.setHours(hh, mm, 0, 0);
        ride.departureTime = base;
      }
    } else if (rideDate && ride.rideType === 'one-time') {
      const base = new Date(rideDate);
      base.setHours(ride.departureTime.getHours(), ride.departureTime.getMinutes(), 0, 0);
      ride.departureTime = base;
      ride.rideDate = new Date(rideDate);
    }

    if (availableSeats !== undefined) {
      const seats = Number(availableSeats);
      if (!Number.isInteger(seats) || seats < 1 || seats > 4) {
        return res.status(400).json({ message: 'Available seats must be between 1 and 4.' });
      }
      const booked = ride.passengers.length;
      ride.availableSeats = Math.max(seats - booked, 0);
      ride.totalSeats = seats;
      ride.status = ride.availableSeats === 0 ? 'Full' : (ride.status === 'Full' ? 'Open' : ride.status);
    }
    if (pricePerSeat !== undefined) ride.pricePerSeat = Number(pricePerSeat);
    if (womenOnly !== undefined) ride.womenOnly = womenOnly;
    if (notes !== undefined) ride.notes = notes.trim().slice(0, 300);

    await ride.save();
    res.json(ride);
  } catch (err) {
    next(err);
  }
});

async function loadOwnedRecurringRide(req, res) {
  const ride = await Ride.findById(req.params.id);
  if (!ride) { res.status(404).json({ message: 'Ride not found' }); return null; }
  if (ride.creator.toString() !== req.user.userId) { res.status(403).json({ message: 'You can only manage your own rides.' }); return null; }
  if (ride.rideType !== 'recurring') { res.status(400).json({ message: 'This action only applies to recurring rides.' }); return null; }
  return ride;
}

router.patch('/:id/pause', auth, requireRole('host'), async (req, res, next) => {
  try {
    const ride = await loadOwnedRecurringRide(req, res);
    if (!ride) return;
    ride.isPaused = true;
    ride.status = 'Paused';
    await ride.save();
    res.json(ride);
  } catch (err) { next(err); }
});

router.patch('/:id/resume', auth, requireRole('host'), async (req, res, next) => {
  try {
    const ride = await loadOwnedRecurringRide(req, res);
    if (!ride) return;
    ride.isPaused = false;
    ride.status = ride.availableSeats === 0 ? 'Full' : 'Open';
    await ride.save();
    res.json(ride);
  } catch (err) { next(err); }
});

router.patch('/:id/cancel-today', auth, requireRole('host'), async (req, res, next) => {
  try {
    const ride = await loadOwnedRecurringRide(req, res);
    if (!ride) return;
    const key = dateKey(new Date());
    if (!ride.skipDates.includes(key)) ride.skipDates.push(key);
    await ride.save();
    res.json({ message: "Today's ride has been cancelled. Tomorrow continues as scheduled.", ride });
  } catch (err) { next(err); }
});

router.patch('/:id/cancel-tomorrow', auth, requireRole('host'), async (req, res, next) => {
  try {
    const ride = await loadOwnedRecurringRide(req, res);
    if (!ride) return;
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const key = dateKey(tomorrow);
    if (!ride.skipDates.includes(key)) ride.skipDates.push(key);
    await ride.save();
    res.json({ message: "Tomorrow's ride has been cancelled.", ride });
  } catch (err) { next(err); }
});

router.patch('/:id/reschedule-today', auth, requireRole('host'), async (req, res, next) => {
  try {
    const { departureTimeStr } = req.body;
    if (!departureTimeStr || !/^\d{2}:\d{2}$/.test(departureTimeStr)) {
      return res.status(400).json({ message: 'A valid new time is required.' });
    }
    const ride = await loadOwnedRecurringRide(req, res);
    if (!ride) return;
    const key = dateKey(new Date());
    ride.dateOverrides.set(key, departureTimeStr);
    await ride.save();
    res.json({ message: "Today's ride has been rescheduled.", ride });
  } catch (err) { next(err); }
});

router.patch('/:id/reschedule-schedule', auth, requireRole('host'), async (req, res, next) => {
  try {
    const { departureTimeStr } = req.body;
    if (!departureTimeStr || !/^\d{2}:\d{2}$/.test(departureTimeStr)) {
      return res.status(400).json({ message: 'A valid new time is required.' });
    }
    const ride = await loadOwnedRecurringRide(req, res);
    if (!ride) return;
    const [hh, mm] = departureTimeStr.split(':').map(Number);
    const newTime = new Date(ride.departureTime);
    newTime.setHours(hh, mm, 0, 0);
    ride.departureTime = newTime;
    ride.dateOverrides = new Map();
    await ride.save();
    res.json({ message: 'All future recurring rides updated to the new time.', ride });
  } catch (err) { next(err); }
});

// DELETE /api/rides/:id — Delete Permanently
router.delete('/:id', auth, requireRole('host'), async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own rides.' });
    }

    await Ride.findByIdAndDelete(req.params.id);
    await Booking.updateMany({ ride: req.params.id }, { $set: { bookingStatus: 'cancelled' } });
    res.json({ message: 'Ride deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/rides/:id/cancel-ride — soft cancel (keeps history)
router.post('/:id/cancel-ride', auth, requireRole('host'), async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only cancel your own rides.' });
    }
    ride.status = 'Cancelled';
    await ride.save();
    await Booking.updateMany({ ride: ride._id }, { $set: { bookingStatus: 'cancelled' } });
    res.json({ message: 'Ride cancelled.', ride });
  } catch (err) { next(err); }
});

// POST /api/rides/:id/cancel — Ride Partner cancels their booking
router.post('/:id/cancel', auth, requireRole('partner'), async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    const passengerIndex = ride.passengers.findIndex(p => p.userId.toString() === req.user.userId);
    if (passengerIndex === -1) {
      return res.status(400).json({ message: 'You do not have a booking on this ride.' });
    }

    const scope = req.body.scope === 'today' ? 'today' : 'all';
    const booking = await Booking.findOne({ ride: ride._id, passenger: req.user.userId, bookingStatus: { $in: ['active', 'paused'] } });

    if (scope === 'today' && booking?.bookingType === 'recurring') {
      const key = dateKey(new Date());
      if (!booking.skipDates.includes(key)) booking.skipDates.push(key);
      await booking.save();
      return res.json({ message: "Today's ride has been cancelled. Your recurring booking continues.", ride });
    }

    ride.passengers.splice(passengerIndex, 1);
    ride.availableSeats += 1;
    if (ride.status === 'Full') ride.status = 'Open';
    await ride.save();

    if (booking) {
      booking.bookingStatus = 'cancelled';
      booking.cancelledFrom = dateKey(new Date());
      await booking.save();
    }

    await User.updateOne(
      { _id: req.user.userId, 'bookedRides.rideId': ride._id },
      { $set: { 'bookedRides.$.status': 'cancelled' } }
    );

    res.json({ message: 'Booking cancelled successfully.', ride });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/booking/pause', auth, requireRole('partner'), async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ ride: req.params.id, passenger: req.user.userId, bookingType: 'recurring', bookingStatus: 'active' });
    if (!booking) return res.status(404).json({ message: 'No active recurring booking found for this ride.' });
    booking.bookingStatus = 'paused';
    await booking.save();
    res.json({ message: 'Booking paused.', booking });
  } catch (err) { next(err); }
});

router.patch('/:id/booking/resume', auth, requireRole('partner'), async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ ride: req.params.id, passenger: req.user.userId, bookingType: 'recurring', bookingStatus: 'paused' });
    if (!booking) return res.status(404).json({ message: 'No paused recurring booking found for this ride.' });
    booking.bookingStatus = 'active';
    await booking.save();
    res.json({ message: 'Booking resumed.', booking });
  } catch (err) { next(err); }
});

// GET /api/rides/my-bookings
router.get('/my-bookings', auth, requireRole('partner'), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ passenger: req.user.userId })
      .sort({ createdAt: -1 })
      .populate({ path: 'ride', populate: { path: 'creator', select: 'name phoneNumber' } });

    const now = new Date();
    const upcomingRides = [];
    const recurringBookings = [];
    const completedTrips = [];
    const cancelledTrips = [];

    bookings.forEach(b => {
      if (!b.ride) return;
      const entry = { booking: b, ride: serializeRide(b.ride, now) };
      if (b.bookingStatus === 'cancelled') {
        cancelledTrips.push(entry);
      } else if (b.bookingType === 'recurring') {
        recurringBookings.push(entry);
      } else if (b.ride.rideType === 'one-time' && new Date(b.ride.departureTime) <= now) {
        completedTrips.push(entry);
      } else {
        upcomingRides.push(entry);
      }
    });

    res.json({ upcomingRides, recurringBookings, completedTrips, cancelledTrips });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
