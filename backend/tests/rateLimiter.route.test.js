const request = require('supertest');

// this file intentionally does NOT mock express-rate-limit — it exists to
// prove the real limiter on /api/auth actually kicks in
jest.mock('../models/User');
const User = require('../models/User');
const app = require('../app');

describe('auth rate limiter', () => {
  test('blocks after 10 requests to /api/auth/* from the same IP within the window', async () => {
    User.findOne.mockResolvedValue(null); // every request fails validation fast (missing fields), that's fine — we're only checking the limiter fires

    const statuses = [];
    for (let i = 0; i < 12; i++) {
      const res = await request(app).post('/api/auth/login').send({});
      statuses.push(res.status);
    }

    // first 10 should be handled normally (400s, since body is empty) —
    // anything past that should be rate-limited
    expect(statuses.slice(0, 10).every(s => s === 400)).toBe(true);
    expect(statuses.slice(10)).toEqual([429, 429]);
  });
});
