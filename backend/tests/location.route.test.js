const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/Ride');
jest.mock('../models/Booking');
jest.mock('../models/RideLocation');

const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const RideLocation = require('../models/RideLocation');
const app = require('../app');

const HOST_ID = 'host123';
const PARTNER_ID = 'partner456';
const OTHER_PARTNER_ID = 'partner789';
const STRANGER_ID = 'stranger000';
const RIDE_ID = 'ride111';

const hostToken = jwt.sign({ userId: HOST_ID, role: 'host' }, process.env.JWT_SECRET);
const partnerToken = jwt.sign({ userId: PARTNER_ID, role: 'partner' }, process.env.JWT_SECRET);
const strangerToken = jwt.sign({ userId: STRANGER_ID, role: 'partner' }, process.env.JWT_SECRET);

const chainable = (value) => ({
  populate: jest.fn().mockImplementation(function () { return this; }),
  then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
});

beforeEach(() => {
  jest.clearAllMocks();
  Ride.findById.mockReturnValue(chainable({ _id: RIDE_ID, creator: { _id: HOST_ID, name: 'Host Name' } }));
});

describe('GET /api/location/:rideId', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).get(`/api/location/${RIDE_ID}`);
    expect(res.status).toBe(401);
  });

  test('404s when the ride does not exist', async () => {
    Ride.findById.mockReturnValue(chainable(null));
    const res = await request(app).get(`/api/location/${RIDE_ID}`).set('Authorization', `Bearer ${hostToken}`);
    expect(res.status).toBe(404);
  });

  test('403s a user who is neither the host nor a booked partner', async () => {
    Booking.findOne.mockResolvedValue(null);
    const res = await request(app).get(`/api/location/${RIDE_ID}`).set('Authorization', `Bearer ${strangerToken}`);
    expect(res.status).toBe(403);
  });

  test('the host sees every partner currently sharing, but not their own pin', async () => {
    RideLocation.find.mockReturnValue(chainable([
      { user: { _id: PARTNER_ID, name: 'Partner One' }, lat: 22.1, lng: 70.1, accuracy: 10, updatedAt: new Date() },
      { user: { _id: OTHER_PARTNER_ID, name: 'Partner Two' }, lat: 22.2, lng: 70.2, accuracy: 15, updatedAt: new Date() },
    ]));
    RideLocation.findOne.mockResolvedValue(null); // host isn't sharing

    const res = await request(app).get(`/api/location/${RIDE_ID}`).set('Authorization', `Bearer ${hostToken}`);

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('host');
    expect(res.body.sharing).toBe(false);
    expect(res.body.others).toHaveLength(2);
    expect(res.body.others.map(o => o.name)).toEqual(['Partner One', 'Partner Two']);

    // host's own query must explicitly exclude themselves
    const findArgs = RideLocation.find.mock.calls[0][0];
    expect(findArgs.ride).toBe(RIDE_ID);
    expect(findArgs.user).toEqual({ $ne: HOST_ID });
  });

  test('a partner only ever sees the host\'s pin, never other partners', async () => {
    Booking.findOne.mockResolvedValue({ _id: 'booking1', bookingStatus: 'active' });
    RideLocation.findOne
      .mockReturnValueOnce(chainable({ user: { _id: HOST_ID, name: 'Host Name' }, lat: 22.3, lng: 70.8, accuracy: 5, updatedAt: new Date() }))
      .mockResolvedValueOnce({ _id: 'mine' }); // the partner's own sharing status (not chained/populated)

    const res = await request(app).get(`/api/location/${RIDE_ID}`).set('Authorization', `Bearer ${partnerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('partner');
    expect(res.body.sharing).toBe(true);
    expect(res.body.others).toHaveLength(1);
    expect(res.body.others[0].name).toBe('Host Name');
    expect(RideLocation.find).not.toHaveBeenCalled();
  });

  test('a partner sees an empty list when the host is not sharing', async () => {
    Booking.findOne.mockResolvedValue({ _id: 'booking1', bookingStatus: 'active' });
    RideLocation.findOne
      .mockReturnValueOnce(chainable(null))
      .mockResolvedValueOnce(null);

    const res = await request(app).get(`/api/location/${RIDE_ID}`).set('Authorization', `Bearer ${partnerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.others).toEqual([]);
  });
});

describe('PUT /api/location/:rideId', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).put(`/api/location/${RIDE_ID}`).send({ lat: 22.3, lng: 70.8 });
    expect(res.status).toBe(401);
  });

  test('rejects a payload missing numeric lat/lng', async () => {
    const res = await request(app)
      .put(`/api/location/${RIDE_ID}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ lat: 'not-a-number', lng: 70.8 });
    expect(res.status).toBe(400);
  });

  test('403s a user not part of the ride', async () => {
    Booking.findOne.mockResolvedValue(null);
    const res = await request(app)
      .put(`/api/location/${RIDE_ID}`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .send({ lat: 22.3, lng: 70.8 });
    expect(res.status).toBe(403);
  });

  test('lets the host push their location', async () => {
    RideLocation.findOneAndUpdate.mockResolvedValue({ ride: RIDE_ID, user: HOST_ID, lat: 22.3, lng: 70.8 });

    const res = await request(app)
      .put(`/api/location/${RIDE_ID}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ lat: 22.3, lng: 70.8, accuracy: 12 });

    expect(res.status).toBe(200);
    expect(RideLocation.findOneAndUpdate).toHaveBeenCalledWith(
      { ride: RIDE_ID, user: HOST_ID },
      expect.objectContaining({ lat: 22.3, lng: 70.8, accuracy: 12 }),
      expect.objectContaining({ upsert: true })
    );
  });

  test('lets a booked partner push their location too', async () => {
    Booking.findOne.mockResolvedValue({ _id: 'booking1', bookingStatus: 'active' });
    RideLocation.findOneAndUpdate.mockResolvedValue({ ride: RIDE_ID, user: PARTNER_ID, lat: 22.4, lng: 70.9 });

    const res = await request(app)
      .put(`/api/location/${RIDE_ID}`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ lat: 22.4, lng: 70.9 });

    expect(res.status).toBe(200);
  });

  test('defaults accuracy to null when not provided', async () => {
    RideLocation.findOneAndUpdate.mockResolvedValue({});
    await request(app)
      .put(`/api/location/${RIDE_ID}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ lat: 22.3, lng: 70.8 });

    const updateArg = RideLocation.findOneAndUpdate.mock.calls[0][1];
    expect(updateArg.accuracy).toBeNull();
  });
});

describe('DELETE /api/location/:rideId', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).delete(`/api/location/${RIDE_ID}`);
    expect(res.status).toBe(401);
  });

  test('removes the caller\'s own location doc', async () => {
    RideLocation.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).delete(`/api/location/${RIDE_ID}`).set('Authorization', `Bearer ${hostToken}`);

    expect(res.status).toBe(200);
    expect(RideLocation.deleteOne).toHaveBeenCalledWith({ ride: RIDE_ID, user: HOST_ID });
  });
});
