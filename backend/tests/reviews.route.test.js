const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/Review');
jest.mock('../models/Booking');
jest.mock('../models/Ride');
jest.mock('../models/User');

const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');
const app = require('../app');

const HOST_ID = 'host123';
const PARTNER_ID = 'partner456';
const RIDE_ID = 'ride789';

const partnerToken = jwt.sign({ userId: PARTNER_ID, role: 'partner' }, process.env.JWT_SECRET);
const hostToken = jwt.sign({ userId: HOST_ID, role: 'host' }, process.env.JWT_SECRET);

const chainable = (value) => {
  const chain = {
    sort: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    populate: jest.fn(() => chain),
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  };
  return chain;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/reviews', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/api/reviews').send({ rideId: RIDE_ID, rating: 5 });
    expect(res.status).toBe(401);
  });

  test('rejects a host trying to leave a review (partner-only route)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ rideId: RIDE_ID, rating: 5 });
    expect(res.status).toBe(403);
  });

  test('rejects a rating that is not a whole number 1-5', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ rideId: RIDE_ID, rating: 3.5 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/whole number/i);
  });

  test('rejects a rating of 0 or 6', async () => {
    const zero = await request(app).post('/api/reviews').set('Authorization', `Bearer ${partnerToken}`).send({ rideId: RIDE_ID, rating: 0 });
    const six = await request(app).post('/api/reviews').set('Authorization', `Bearer ${partnerToken}`).send({ rideId: RIDE_ID, rating: 6 });
    expect(zero.status).toBe(400);
    expect(six.status).toBe(400);
  });

  test('404s when the ride does not exist', async () => {
    Ride.findById.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ rideId: RIDE_ID, rating: 5 });

    expect(res.status).toBe(404);
  });

  test('403s when the reviewer never booked this ride', async () => {
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, creator: HOST_ID, departureTime: new Date(Date.now() - 100000) });
    Booking.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ rideId: RIDE_ID, rating: 5 });

    expect(res.status).toBe(403);
  });

  test('403s when the reviewer\'s booking was cancelled', async () => {
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, creator: HOST_ID, departureTime: new Date(Date.now() - 100000) });
    Booking.findOne.mockResolvedValue({ bookingType: 'single', bookingStatus: 'cancelled' });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ rideId: RIDE_ID, rating: 5 });

    expect(res.status).toBe(403);
  });

  test('400s for a one-time ride that has not happened yet', async () => {
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, creator: HOST_ID, departureTime: new Date(Date.now() + 100000) });
    Booking.findOne.mockResolvedValue({ bookingType: 'single', bookingStatus: 'active' });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ rideId: RIDE_ID, rating: 5 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/happened/i);
  });

  test('allows reviewing a recurring booking even before today\'s occurrence time', async () => {
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, creator: HOST_ID, departureTime: new Date(Date.now() + 100000) });
    Booking.findOne.mockResolvedValue({ bookingType: 'recurring', bookingStatus: 'active' });
    Review.findOne.mockResolvedValue(null);
    Review.create.mockResolvedValue({ _id: 'rev1', rating: 4, comment: '' });
    Review.aggregate.mockResolvedValue([{ avg: 4, count: 1 }]);
    User.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ rideId: RIDE_ID, rating: 4 });

    expect(res.status).toBe(201);
  });

  test('creates a new review and recalculates the host rating', async () => {
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, creator: HOST_ID, departureTime: new Date(Date.now() - 100000) });
    Booking.findOne.mockResolvedValue({ bookingType: 'single', bookingStatus: 'active' });
    Review.findOne.mockResolvedValue(null);
    Review.create.mockResolvedValue({ _id: 'rev1', rating: 5, comment: 'Great ride!' });
    Review.aggregate.mockResolvedValue([{ avg: 4.5, count: 3 }]);
    User.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ rideId: RIDE_ID, rating: 5, comment: 'Great ride!' });

    expect(res.status).toBe(201);
    expect(Review.create).toHaveBeenCalledWith(expect.objectContaining({
      ride: RIDE_ID, host: HOST_ID, reviewer: PARTNER_ID, rating: 5, comment: 'Great ride!'
    }));
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(HOST_ID, { rating: 4.5, reviewCount: 3 });
  });

  test('edits an existing review instead of creating a duplicate', async () => {
    const existing = { rating: 2, comment: 'meh', save: jest.fn().mockResolvedValue(true) };
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, creator: HOST_ID, departureTime: new Date(Date.now() - 100000) });
    Booking.findOne.mockResolvedValue({ bookingType: 'single', bookingStatus: 'active' });
    Review.findOne.mockResolvedValue(existing);
    Review.aggregate.mockResolvedValue([{ avg: 5, count: 1 }]);
    User.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ rideId: RIDE_ID, rating: 5, comment: 'Actually great' });

    expect(res.status).toBe(201);
    expect(existing.rating).toBe(5);
    expect(existing.comment).toBe('Actually great');
    expect(existing.save).toHaveBeenCalledTimes(1);
    expect(Review.create).not.toHaveBeenCalled();
  });

  test('truncates a comment longer than 300 characters', async () => {
    Ride.findById.mockResolvedValue({ _id: RIDE_ID, creator: HOST_ID, departureTime: new Date(Date.now() - 100000) });
    Booking.findOne.mockResolvedValue({ bookingType: 'single', bookingStatus: 'active' });
    Review.findOne.mockResolvedValue(null);
    Review.create.mockResolvedValue({ _id: 'rev1' });
    Review.aggregate.mockResolvedValue([{ avg: 5, count: 1 }]);
    User.findByIdAndUpdate.mockResolvedValue({});

    const longComment = 'x'.repeat(500);
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ rideId: RIDE_ID, rating: 5, comment: longComment });

    const createArg = Review.create.mock.calls[0][0];
    expect(createArg.comment.length).toBe(300);
  });
});

describe('GET /api/reviews/host/:hostId', () => {
  test('is public (no auth required) and returns a list', async () => {
    Review.find.mockReturnValue(chainable([{ _id: 'r1', rating: 5 }]));

    const res = await request(app).get(`/api/reviews/host/${HOST_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ _id: 'r1', rating: 5 }]);
  });
});

describe('GET /api/reviews/ride/:rideId/mine', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).get(`/api/reviews/ride/${RIDE_ID}/mine`);
    expect(res.status).toBe(401);
  });

  test('rejects a host (partner-only route)', async () => {
    const res = await request(app).get(`/api/reviews/ride/${RIDE_ID}/mine`).set('Authorization', `Bearer ${hostToken}`);
    expect(res.status).toBe(403);
  });

  test('returns null when the partner has not reviewed this ride yet', async () => {
    Review.findOne.mockResolvedValue(null);
    const res = await request(app).get(`/api/reviews/ride/${RIDE_ID}/mine`).set('Authorization', `Bearer ${partnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ review: null });
  });
});
