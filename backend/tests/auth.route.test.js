const request = require('supertest');
const bcrypt = require('bcryptjs');

// the real authLimiter caps this route at 10 req / 15 min per IP, and this
// suite fires more than that against one shared in-memory app — the limiter
// itself is covered separately in rateLimiter.route.test.js
jest.mock('express-rate-limit', () => () => (req, res, next) => next());

jest.mock('../models/User');
const User = require('../models/User');
const app = require('../app');

const validHostBody = {
  name: 'Priya Shah',
  email: 'priya@marwadiuniversity.ac.in',
  password: 'Str0ngPass',
  role: 'host',
  phoneNumber: '9876543210',
  vehicle: { number: 'GJ-01-AB-1234', type: 'Car', model: 'Swift', color: 'White' }
};

const validPartnerBody = {
  name: 'Rahul Mehta',
  email: 'rahul@marwadiuniversity.ac.in',
  password: 'Str0ngPass',
  role: 'partner'
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/register — input validation', () => {
  test('rejects a missing name/email/password', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@marwadiuniversity.ac.in', password: 'Str0ngPass', role: 'partner' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name.*email.*password/i);
  });

  test('rejects an invalid role', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPartnerBody, role: 'admin' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid role/i);
  });

  test('rejects a host with no phone number', async () => {
    const { phoneNumber, ...body } = validHostBody;
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/mobile number/i);
  });

  test('rejects a host with a malformed phone number', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validHostBody, phoneNumber: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid mobile number/i);
  });

  test('rejects a host with no vehicle number', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validHostBody, vehicle: { number: '' } });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/vehicle number/i);
  });

  test('rejects a name shorter than 2 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPartnerBody, name: 'A' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name must be/i);
  });

  test('rejects a malformed email address', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPartnerBody, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid email/i);
  });

  test('rejects an email outside the university domain', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPartnerBody, email: 'rahul@gmail.com' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/marwadiuniversity\.ac\.in/i);
  });

  test('rejects a weak password (too short)', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPartnerBody, password: 'short1A' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8 characters/i);
  });

  test('rejects a password with no uppercase letter', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPartnerBody, password: 'lowercase1' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/uppercase/i);
  });

  test('rejects a password with no number', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPartnerBody, password: 'NoNumberHere' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/number/i);
  });

  test('rejects when the email is already registered', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing' });
    const res = await request(app).post('/api/auth/register').send(validPartnerBody);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

describe('POST /api/auth/register — success paths', () => {
  test('registers a valid partner and hashes the password before saving', async () => {
    User.findOne.mockResolvedValue(null);
    const saveMock = jest.fn().mockResolvedValue(true);
    User.mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = saveMock;
    });

    const res = await request(app).post('/api/auth/register').send(validPartnerBody);

    expect(res.status).toBe(201);
    expect(saveMock).toHaveBeenCalledTimes(1);
    const constructedWith = User.mock.calls[0][0];
    expect(constructedWith.password).not.toBe(validPartnerBody.password); // must be hashed
    expect(await bcrypt.compare(validPartnerBody.password, constructedWith.password)).toBe(true);
    expect(constructedWith.email).toBe(validPartnerBody.email.toLowerCase());
  });

  test('registers a valid host with vehicle details attached', async () => {
    User.findOne.mockResolvedValue(null);
    const saveMock = jest.fn().mockResolvedValue(true);
    User.mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = saveMock;
    });

    const res = await request(app).post('/api/auth/register').send(validHostBody);

    expect(res.status).toBe(201);
    const constructedWith = User.mock.calls[0][0];
    expect(constructedWith.vehicle).toEqual({ number: 'GJ-01-AB-1234', type: 'Car', model: 'Swift', color: 'White' });
  });
});

describe('POST /api/auth/login', () => {
  test('rejects a missing email/password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@marwadiuniversity.ac.in' });
    expect(res.status).toBe(400);
  });

  test('rejects a malformed email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email', password: 'x' });
    expect(res.status).toBe(400);
  });

  test('404s when no user matches the email', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ email: 'ghost@marwadiuniversity.ac.in', password: 'whatever' });
    expect(res.status).toBe(404);
  });

  test('rejects an incorrect password', async () => {
    const hashed = await bcrypt.hash('CorrectPass1', 10);
    User.findOne.mockResolvedValue({ _id: 'u1', email: 'a@marwadiuniversity.ac.in', password: hashed, role: 'partner', name: 'A', gender: '' });

    const res = await request(app).post('/api/auth/login').send({ email: 'a@marwadiuniversity.ac.in', password: 'WrongPass1' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('logs in successfully and returns a usable JWT', async () => {
    const hashed = await bcrypt.hash('CorrectPass1', 10);
    User.findOne.mockResolvedValue({ _id: 'u1', email: 'a@marwadiuniversity.ac.in', password: hashed, role: 'host', name: 'A Host', gender: 'Male' });

    const res = await request(app).post('/api/auth/login').send({ email: 'a@marwadiuniversity.ac.in', password: 'CorrectPass1' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toEqual({ id: 'u1', name: 'A Host', gender: 'Male', role: 'host' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe('u1');
    expect(decoded.role).toBe('host');
  });
});
