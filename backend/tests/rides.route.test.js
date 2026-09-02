const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/Ride');
jest.mock('../models/Booking');
jest.mock('../models/User');
jest.mock('../models/Review');

const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const User = require('../models/User');
const app = require('../app');

const HOST_ID = 'host123';
const PARTNER_ID = 'partner456';
const RIDE_ID = 'ride789';

const hostToken = jwt.sign({ userId: HOST_ID, role: 'host' }, process.env.JWT_SECRET);
const partnerToken = jwt.sign({ userId: PARTNER_ID, role: 'partner' }, process.env.JWT_SECRET);

const chainable = (value) => ({
  sort: jest.fn().mockImplementation(function () { return this; }),
  populate: jest.fn().mockImplementation(function () { return this; }),
  then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/rides (public listing)', () => {
  test('requires no auth and returns the grouped shape', async () => {
    Ride.find.mockReturnValue(chainable([]));
    const res = await request(app).get('/api/rides');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      all: [], todaysOneTimeRides: [], todaysRecurringRides: [], upcomingOneTimeRides: []
    });
  });

  test('splits a one-time ride into today vs upcoming based on its date', async () => {
    const today = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // first Ride.find call in the route is for one-time rides, second is recurring
    Ride.find
      .mockReturnValueOnce(chainable([
        { rideType: 'one-time', departureTime: today, toObject: () => ({ rideType: 'one-time', departureTime: today }) },
        { rideType: 'one-time', departureTime: nextWeek, toObject: () => ({ rideType: 'one-time', departureTime: nextWeek }) },
      ]))
      .mockReturnValueOnce(chainable([]));

    const res = await request(app).get('/api/rides');

    expect(res.status).toBe(200);
    expect(res.body.todaysOneTimeRides).toHaveLength(1);
    expect(res.body.upcomingOneTimeRides).toHaveLength(1);
  });
});

describe('POST /api/rides (create)', () => {
  const validBody = {
    rideType: 'one-time',
    pickupLocation: 'Campus Gate',
    dropoffLocation: 'Railway Station',
    rideDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    departureTimeStr: '08:30',
    availableSeats: 3,
    pricePerSeat: 40
  };

  test('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/api/rides').send(validBody);
    expect(res.status).toBe(401);
  });

  test('rejects a partner (host-only route)', async () => {
    const res = await request(app).post('/api/rides').set('Authorization', `Bearer ${partnerToken}`).send(validBody);
    expect(res.status).toBe(403);
  });

  test('404s when the host record is missing', async () => {
    User.findById.mockResolvedValue(null);
    const res = await request(app).post('/api/rides').set('Authorization', `Bearer ${hostToken}`).send(validBody);
    expect(res.status).toBe(404);
  });

  test('rejects a host with no vehicle registered', async () => {
    User.findById.mockResolvedValue({ _id: HOST_ID, vehicle: {} });
    const res = await request(app).post('/api/rides').set('Authorization', `Bearer ${hostToken}`).send(validBody);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/vehicle details/i);
  });

  test('rejects invalid ride input (delegates to validateRideInput)', async () => {
    User.findById.mockResolvedValue({ _id: HOST_ID, vehicle: { number: 'GJ-1' } });
    const res = await request(app).post('/api/rides').set('Authorization', `Bearer ${hostToken}`).send({ ...validBody, availableSeats: 99 });
    expect(res.status).toBe(400);
  });

  test('rejects a departure time in the past', async () => {
    User.findById.mockResolvedValue({ _id: HOST_ID, vehicle: { number: 'GJ-1' } });
    const res = await request(app).post('/api/rides').set('Authorization', `Bearer ${hostToken}`)
      .send({ ...validBody, rideDate: '2020-01-01' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/future/i);
  });

  test('rejects a women-only ride created by a non-female host', async () => {
    User.findById.mockResolvedValue({ _id: HOST_ID, vehicle: { number: 'GJ-1' }, gender: 'Male' });
    const res = await request(app).post('/api/rides').set('Authorization', `Bearer ${hostToken}`)
      .send({ ...validBody, womenOnly: true });
    expect(res.status).toBe(403);
  });

  test('creates a valid ride', async () => {
    User.findById.mockResolvedValue({ _id: HOST_ID, vehicle: { number: 'GJ-1', type: 'Car', model: 'Swift', color: 'Red' }, gender: 'Male' });
    const saveMock = jest.fn().mockResolvedValue(true);
    Ride.mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = saveMock;
      this.toJSON = undefined;
    });

    const res = await request(app).post('/api/rides').set('Authorization', `Bearer ${hostToken}`).send(validBody);

    expect(res.status).toBe(201);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});

describe('POST /api/rides/:id/book', () => {
  beforeEach(() => {
    Ride.findById.mockResolvedValue({
      _id: RIDE_ID, creator: HOST_ID, status: 'Open', isPaused: false, rideType: 'one-time',
      availableSeats: 2, womenOnly: false, passengers: [], save: jest.fn().mockResolvedValue(true)
    });
    Booking.findOne.mockResolvedValue(null);
    Booking.mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(true);
      this.toJSON = undefined;
    });
    User.findById.mockResolvedValue({ _id: PARTNER_ID, gender: 'Male', bookedRides: [], save: jest.fn().mockResolvedValue(true) });
  });

  test('rejects an unauthenticated request', async () => {
    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).send({});
    expect(res.status).toBe(401);
  });

  test('rejects a host (partner-only route)', async () => {
    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${hostToken}`).send({});
    expect(res.status).toBe(403);
  });

  test('404s when the ride does not exist', async () => {
    Ride.findById.mockResolvedValue(null);
    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${partnerToken}`).send({});
    expect(res.status).toBe(404);
  });

  test('rejects booking a cancelled ride', async () => {
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, status: 'Cancelled', isPaused: false });
    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${partnerToken}`).send({});
    expect(res.status).toBe(400);
  });

  test('rejects a recurring booking on a one-time ride', async () => {
    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${partnerToken}`).send({ bookingType: 'recurring' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/only available for recurring/i);
  });

  test('rejects a host trying to book their own ride', async () => {
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, creator: PARTNER_ID, status: 'Open', isPaused: false, rideType: 'one-time', availableSeats: 2 });
    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${partnerToken}`).send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/own ride/i);
  });

  test('rejects a duplicate active booking', async () => {
    Booking.findOne.mockResolvedValue({ _id: 'existing' });
    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${partnerToken}`).send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already have a booking/i);
  });

  test('rejects booking when no seats remain', async () => {
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, creator: HOST_ID, status: 'Open', isPaused: false, rideType: 'one-time', availableSeats: 0 });
    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${partnerToken}`).send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no seats/i);
  });

  test('rejects a non-female partner booking a women-only ride', async () => {
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, creator: HOST_ID, status: 'Open', isPaused: false, rideType: 'one-time', availableSeats: 2, womenOnly: true });
    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${partnerToken}`).send({});
    expect(res.status).toBe(403);
  });

  test('books successfully, decrementing seats and recording history', async () => {
    const rideDoc = {
      _id: RIDE_ID, creator: HOST_ID, status: 'Open', isPaused: false, rideType: 'one-time',
      availableSeats: 2, womenOnly: false, passengers: [], save: jest.fn().mockResolvedValue(true)
    };
    Ride.findById.mockResolvedValue(rideDoc);

    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${partnerToken}`).send({});

    expect(res.status).toBe(200);
    expect(rideDoc.availableSeats).toBe(1);
    expect(rideDoc.passengers).toHaveLength(1);
    expect(rideDoc.save).toHaveBeenCalledTimes(1);
    expect(res.body.message).toMatch(/booked successfully/i);
  });

  test('marks the ride Full when the last seat is taken', async () => {
    const rideDoc = {
      _id: RIDE_ID, creator: HOST_ID, status: 'Open', isPaused: false, rideType: 'one-time',
      availableSeats: 1, womenOnly: false, passengers: [], save: jest.fn().mockResolvedValue(true)
    };
    Ride.findById.mockResolvedValue(rideDoc);

    const res = await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${partnerToken}`).send({});

    expect(res.status).toBe(200);
    expect(rideDoc.availableSeats).toBe(0);
    expect(rideDoc.status).toBe('Full');
  });

  test('does not duplicate an entry in the user\'s ride history if it\'s already there', async () => {
    const rideDoc = {
      _id: RIDE_ID, creator: HOST_ID, status: 'Open', isPaused: false, rideType: 'one-time',
      availableSeats: 2, womenOnly: false, passengers: [], save: jest.fn().mockResolvedValue(true)
    };
    Ride.findById.mockResolvedValue(rideDoc);
    const userSave = jest.fn().mockResolvedValue(true);
    User.findById.mockResolvedValue({
      _id: PARTNER_ID, gender: 'Male', bookedRides: [{ rideId: { toString: () => RIDE_ID } }], save: userSave
    });

    await request(app).post(`/api/rides/${RIDE_ID}/book`).set('Authorization', `Bearer ${partnerToken}`).send({});

    expect(userSave).not.toHaveBeenCalled();
  });
});
