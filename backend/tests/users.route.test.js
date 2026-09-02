const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('../models/Ride');

const User = require('../models/User');
const Ride = require('../models/Ride');
const app = require('../app');

const USER_ID = 'user123';
const token = jwt.sign({ userId: USER_ID, role: 'partner' }, process.env.JWT_SECRET);
const hostToken = jwt.sign({ userId: USER_ID, role: 'host' }, process.env.JWT_SECRET);

const chainable = (value) => ({
  populate: jest.fn().mockImplementation(function () { return this; }),
  select: jest.fn().mockImplementation(function () { return this; }),
  sort: jest.fn().mockImplementation(function () { return this; }),
  then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/users/profile', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(401);
  });

  test('404s when the user no longer exists', async () => {
    User.findById.mockReturnValue(chainable(null));
    const res = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('returns the profile without the password field', async () => {
    User.findById.mockReturnValue(chainable({ _id: USER_ID, name: 'Test User', email: 'a@marwadiuniversity.ac.in' }));
    const res = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test User');

    const selectArg = User.findById.mock.results[0].value.select.mock.calls[0][0];
    expect(selectArg).toBe('-password');
  });
});

describe('PUT /api/users/profile', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).put('/api/users/profile').send({ name: 'New Name' });
    expect(res.status).toBe(401);
  });

  test('rejects a name outside the 2-50 character range', async () => {
    const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${token}`).send({ name: 'A' });
    expect(res.status).toBe(400);
  });

  test('rejects a malformed phone number', async () => {
    const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${token}`).send({ phoneNumber: 'abc' });
    expect(res.status).toBe(400);
  });

  test('rejects an invalid gender value', async () => {
    const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${token}`).send({ gender: 'Robot' });
    expect(res.status).toBe(400);
  });

  test('rejects a host clearing their vehicle number', async () => {
    const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${hostToken}`).send({ vehicle: { number: '' } });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/vehicle number/i);
  });

  test('allows a partner to submit an empty vehicle object', async () => {
    User.findByIdAndUpdate.mockReturnValue(chainable({ _id: USER_ID, vehicle: { number: '' } }));
    const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${token}`).send({ vehicle: { number: '' } });
    expect(res.status).toBe(200);
  });

  test('404s when updating a user that no longer exists', async () => {
    User.findByIdAndUpdate.mockReturnValue(chainable(null));
    const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${token}`).send({ name: 'Valid Name' });
    expect(res.status).toBe(404);
  });

  test('trims and applies a valid update', async () => {
    User.findByIdAndUpdate.mockReturnValue(chainable({ _id: USER_ID, name: 'Trimmed Name' }));
    const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${token}`).send({ name: '  Trimmed Name  ' });

    expect(res.status).toBe(200);
    const updateArg = User.findByIdAndUpdate.mock.calls[0][1];
    expect(updateArg.$set.name).toBe('Trimmed Name');
  });
});

describe('GET /api/users/history', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/users/history');
    expect(res.status).toBe(401);
  });

  test('404s when the user record is missing', async () => {
    Ride.find.mockReturnValue(chainable([]));
    User.findById.mockReturnValue(chainable(null));
    const res = await request(app).get('/api/users/history').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('filters out bookings whose ride was deleted', async () => {
    Ride.find.mockReturnValue(chainable([{ _id: 'r1' }]));
    User.findById.mockReturnValue(chainable({
      bookedRides: [
        { rideId: { toObject: () => ({ _id: 'r2', departureTime: new Date(2026, 0, 1) }) }, bookedAt: new Date() },
        { rideId: null, bookedAt: new Date() }, 
      ]
    }));

    const res = await request(app).get('/api/users/history').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.bookedRides).toHaveLength(1);
    expect(res.body.bookedRides[0]._id).toBe('r2');
  });
});
