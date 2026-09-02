const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/Message');
jest.mock('../models/User');

const Message = require('../models/Message');
const User = require('../models/User');
const app = require('../app');

const USER_ID = 'user123';
const OTHER_ID = 'other456';
const token = jwt.sign({ userId: USER_ID, role: 'partner' }, process.env.JWT_SECRET);

const chainable = (value) => ({
  sort: jest.fn().mockImplementation(function () { return this; }),
  populate: jest.fn().mockImplementation(function () { return this; }),
  select: jest.fn().mockImplementation(function () { return this; }),
  then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/messages', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/api/messages').send({ receiverId: OTHER_ID, content: 'hi' });
    expect(res.status).toBe(401);
  });

  test('rejects a missing receiverId or content', async () => {
    const res = await request(app).post('/api/messages').set('Authorization', `Bearer ${token}`).send({ content: 'hi' });
    expect(res.status).toBe(400);
  });

  test('rejects a whitespace-only message', async () => {
    const res = await request(app).post('/api/messages').set('Authorization', `Bearer ${token}`).send({ receiverId: OTHER_ID, content: '   ' });
    expect(res.status).toBe(400);
  });

  test('rejects a message over 1000 characters', async () => {
    const res = await request(app).post('/api/messages').set('Authorization', `Bearer ${token}`).send({ receiverId: OTHER_ID, content: 'x'.repeat(1001) });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too long/i);
  });

  test('rejects messaging yourself', async () => {
    const res = await request(app).post('/api/messages').set('Authorization', `Bearer ${token}`).send({ receiverId: USER_ID, content: 'hi' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/yourself/i);
  });

  test('404s when the receiver does not exist', async () => {
    User.findById.mockResolvedValue(null);
    const res = await request(app).post('/api/messages').set('Authorization', `Bearer ${token}`).send({ receiverId: OTHER_ID, content: 'hi' });
    expect(res.status).toBe(404);
  });

  test('sends a valid message, trimmed', async () => {
    User.findById.mockResolvedValue({ _id: OTHER_ID });
    const saveMock = jest.fn().mockResolvedValue(true);
    Message.mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = saveMock;
      this.toJSON = undefined; // the automock inherits a stubbed toJSON() -> undefined, which breaks res.json()
    });

    const res = await request(app).post('/api/messages').set('Authorization', `Bearer ${token}`).send({ receiverId: OTHER_ID, content: '  hello there  ' });

    expect(res.status).toBe(201);
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(res.body.content).toBe('hello there');
  });
});

describe('GET /api/messages/:partnerId', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).get(`/api/messages/${OTHER_ID}`);
    expect(res.status).toBe(401);
  });

  test('returns the conversation and marks the partner\'s messages as read', async () => {
    Message.find.mockReturnValue(chainable([{ _id: 'm1', content: 'hi', sender: { _id: OTHER_ID, name: 'B' }, receiver: { _id: USER_ID, name: 'A' } }]));
    Message.updateMany.mockResolvedValue({ modifiedCount: 2 });
    User.findById.mockReturnValue(chainable({ _id: OTHER_ID, name: 'B' }));

    const res = await request(app).get(`/api/messages/${OTHER_ID}`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(1);
    expect(Message.updateMany).toHaveBeenCalledWith(
      { sender: OTHER_ID, receiver: USER_ID, isRead: false },
      { $set: { isRead: true } }
    );
  });
});

describe('GET /api/messages (inbox)', () => {
  test('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/messages');
    expect(res.status).toBe(401);
  });

  test('collapses messages into one row per conversation, keeping the latest', async () => {
    const older = { _id: 'm1', content: 'first', timestamp: new Date(2026, 0, 1), isRead: true, sender: { _id: USER_ID }, receiver: { _id: OTHER_ID } };
    const newer = { _id: 'm2', content: 'second', timestamp: new Date(2026, 0, 2), isRead: false, sender: { _id: OTHER_ID }, receiver: { _id: USER_ID } };
    // route sorts by timestamp desc before building the map, so "newer" arrives first
    Message.find.mockReturnValue(chainable([newer, older]));

    const res = await request(app).get('/api/messages').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1); // one conversation, not two rows
    expect(res.body[0].latestMessage).toBe('second');
    expect(res.body[0].isUnread).toBe(true);
  });

  test('returns an empty inbox when there are no messages', async () => {
    Message.find.mockReturnValue(chainable([]));
    const res = await request(app).get('/api/messages').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
