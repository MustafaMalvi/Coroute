const mongoose = require('mongoose');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const RideLocation = require('../models/RideLocation');
const Message = require('../models/Message');

const oid = () => new mongoose.Types.ObjectId();

describe('User model', () => {
  test('rejects a doc missing required fields', () => {
    const err = new User({}).validateSync();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  test('rejects an invalid role', () => {
    const err = new User({ name: 'A', email: 'a@x.com', password: 'x', role: 'admin' }).validateSync();
    expect(err.errors.role).toBeDefined();
  });

  test('defaults role to partner when omitted', () => {
    const user = new User({ name: 'A', email: 'a@x.com', password: 'x' });
    expect(user.role).toBe('partner');
  });

  test('defaults rating to 5 and reviewCount to 0', () => {
    const user = new User({ name: 'A', email: 'a@x.com', password: 'x' });
    expect(user.rating).toBe(5);
    expect(user.reviewCount).toBe(0);
  });

  test('rejects a rating outside 0-5', () => {
    const err = new User({ name: 'A', email: 'a@x.com', password: 'x', rating: 5.5 }).validateSync();
    expect(err.errors.rating).toBeDefined();
  });

  test('accepts a fully valid host', () => {
    const err = new User({
      name: 'Priya Shah', email: 'priya@example.edu', password: 'hashed',
      role: 'host', phoneNumber: '9876543210', vehicle: { number: 'GJ-01-AB-1234' }
    }).validateSync();
    expect(err).toBeUndefined();
  });
});

describe('Ride model', () => {
  test('rejects a doc missing required fields', () => {
    const err = new Ride({}).validateSync();
    expect(err.errors.creator).toBeDefined();
    expect(err.errors.pickupLocation).toBeDefined();
    expect(err.errors.dropoffLocation).toBeDefined();
    expect(err.errors.departureTime).toBeDefined();
  });

  test('rejects an invalid rideType', () => {
    const err = new Ride({
      creator: oid(), pickupLocation: 'A', dropoffLocation: 'B',
      departureTime: new Date(), rideType: 'weekly'
    }).validateSync();
    expect(err.errors.rideType).toBeDefined();
  });

  test('rejects a repeatDays entry that is not a real weekday', () => {
    const err = new Ride({
      creator: oid(), pickupLocation: 'A', dropoffLocation: 'B',
      departureTime: new Date(), rideType: 'recurring', repeatDays: ['Funday']
    }).validateSync();
    expect(err.errors['repeatDays.0']).toBeDefined();
  });

  test('accepts a valid one-time ride', () => {
    const err = new Ride({
      creator: oid(), pickupLocation: 'Campus Gate', dropoffLocation: 'Railway Station',
      departureTime: new Date(Date.now() + 3600_000), pricePerSeat: 50
    }).validateSync();
    expect(err).toBeUndefined();
  });

  test('exposes WEEKDAYS as a static on the exported model', () => {
    expect(Ride.WEEKDAYS).toEqual([
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]);
  });
});

describe('Booking model', () => {
  test('rejects a doc missing required fields', () => {
    const err = new Booking({}).validateSync();
    expect(err.errors.ride).toBeDefined();
    expect(err.errors.passenger).toBeDefined();
  });

  test('defaults bookingType to single and bookingStatus to active', () => {
    const booking = new Booking({ ride: oid(), passenger: oid() });
    expect(booking.bookingType).toBe('single');
    expect(booking.bookingStatus).toBe('active');
  });

  test('rejects an invalid bookingStatus', () => {
    const err = new Booking({ ride: oid(), passenger: oid(), bookingStatus: 'on-hold' }).validateSync();
    expect(err.errors.bookingStatus).toBeDefined();
  });
});

describe('Review model', () => {
  test('rejects a doc missing required fields', () => {
    const err = new Review({}).validateSync();
    expect(err.errors.ride).toBeDefined();
    expect(err.errors.host).toBeDefined();
    expect(err.errors.reviewer).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  test('rejects a rating below 1 or above 5', () => {
    const tooLow = new Review({ ride: oid(), host: oid(), reviewer: oid(), rating: 0 }).validateSync();
    const tooHigh = new Review({ ride: oid(), host: oid(), reviewer: oid(), rating: 6 }).validateSync();
    expect(tooLow.errors.rating).toBeDefined();
    expect(tooHigh.errors.rating).toBeDefined();
  });

  test('accepts a valid review at each end of the rating scale', () => {
    expect(new Review({ ride: oid(), host: oid(), reviewer: oid(), rating: 1 }).validateSync()).toBeUndefined();
    expect(new Review({ ride: oid(), host: oid(), reviewer: oid(), rating: 5 }).validateSync()).toBeUndefined();
  });

  test('caps comment length at 300 characters', () => {
    const err = new Review({
      ride: oid(), host: oid(), reviewer: oid(), rating: 4, comment: 'x'.repeat(301)
    }).validateSync();
    expect(err.errors.comment).toBeDefined();
  });
});

describe('RideLocation model', () => {
  test('rejects a doc missing required fields', () => {
    const err = new RideLocation({}).validateSync();
    expect(err.errors.ride).toBeDefined();
    expect(err.errors.user).toBeDefined();
    expect(err.errors.lat).toBeDefined();
    expect(err.errors.lng).toBeDefined();
  });

  test('accepts a valid location doc and defaults accuracy to null', () => {
    const loc = new RideLocation({ ride: oid(), user: oid(), lat: 22.3, lng: 70.8 });
    expect(loc.validateSync()).toBeUndefined();
    expect(loc.accuracy).toBeNull();
  });
});

describe('Message model', () => {
  test('rejects a doc missing required fields', () => {
    const err = new Message({}).validateSync();
    expect(err.errors.sender).toBeDefined();
    expect(err.errors.receiver).toBeDefined();
    expect(err.errors.content).toBeDefined();
  });

  test('defaults isRead to false', () => {
    const msg = new Message({ sender: oid(), receiver: oid(), content: 'hi' });
    expect(msg.isRead).toBe(false);
  });
});
