const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('auth middleware', () => {
  test('rejects a request with no Authorization header', () => {
    const req = { header: () => undefined };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a malformed/invalid token', () => {
    const req = { header: () => 'Bearer not-a-real-token' };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a token signed with the wrong secret', () => {
    const token = jwt.sign({ userId: 'u1', role: 'host' }, 'someone-elses-secret');
    const req = { header: () => `Bearer ${token}` };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts a valid "Bearer <token>" header and attaches req.user', () => {
    const token = jwt.sign({ userId: 'u1', role: 'host' }, process.env.JWT_SECRET);
    const req = { header: () => `Bearer ${token}` };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ userId: 'u1', role: 'host' });
  });

  test('also accepts a bare token with no "Bearer " prefix', () => {
    const token = jwt.sign({ userId: 'u2', role: 'partner' }, process.env.JWT_SECRET);
    const req = { header: () => token };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ userId: 'u2', role: 'partner' });
  });

  test('rejects an expired token', () => {
    const token = jwt.sign({ userId: 'u1', role: 'host' }, process.env.JWT_SECRET, { expiresIn: -10 });
    const req = { header: () => `Bearer ${token}` };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireRole middleware', () => {
  test('rejects when auth middleware has not run (no req.user)', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    requireRole('host')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a user whose role is not in the allowed list', () => {
    const req = { user: { userId: 'u1', role: 'partner' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('host')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('allows a user whose role matches', () => {
    const req = { user: { userId: 'u1', role: 'host' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('host')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('allows any role in a multi-role whitelist', () => {
    const req = { user: { userId: 'u1', role: 'partner' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('host', 'partner')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
