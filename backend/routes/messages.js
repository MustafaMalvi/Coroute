const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// POST /api/messages
// Send a message to another user
router.post('/', auth, async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;

    // ── Input Validation ──
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and message content are required.' });
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({ message: 'Message is too long (max 1000 characters).' });
    }

    // Prevent messaging yourself
    if (receiverId === req.user.userId) {
      return res.status(400).json({ message: 'You cannot send a message to yourself.' });
    }
    
    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newMessage = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      content: content.trim()
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/:partnerId
// Get conversation history with a specific user
router.get('/:partnerId', auth, async (req, res, next) => {
  try {
    const { partnerId } = req.params;

    // Fetch messages where either I sent to partner, or partner sent to me
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: partnerId },
        { sender: partnerId, receiver: req.user.userId }
      ]
    })
    .sort({ timestamp: 1 }) // Chronological order
    .populate('sender', 'name')
    .populate('receiver', 'name');

    // Opening this conversation counts as reading the partner's messages
    await Message.updateMany(
      { sender: partnerId, receiver: req.user.userId, isRead: false },
      { $set: { isRead: true } }
    );

    // Partner Details (to show in the header)
    const partner = await User.findById(partnerId).select('name phoneNumber _id');

    res.json({
      partner,
      messages
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/messages
// Get all recent chat partners (Inbox)
router.get('/', auth, async (req, res, next) => {
  try {
    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender: req.user.userId }, { receiver: req.user.userId }]
    })
    .sort({ timestamp: -1 })
    .populate('sender', 'name')
    .populate('receiver', 'name');

    // Extract unique partners and their latest message
    const conversationsMap = new Map();

    messages.forEach(msg => {
      // Determine exactly who the other person is
      const partnerIdStr = msg.sender._id.toString() === req.user.userId 
        ? msg.receiver._id.toString() 
        : msg.sender._id.toString();
        
      const partnerData = msg.sender._id.toString() === req.user.userId 
        ? msg.receiver 
        : msg.sender;

      if (!conversationsMap.has(partnerIdStr)) {
        conversationsMap.set(partnerIdStr, {
          partner: partnerData,
          latestMessage: msg.content,
          timestamp: msg.timestamp,
          isUnread: !msg.isRead && msg.receiver._id.toString() === req.user.userId
        });
      }
    });

    res.json(Array.from(conversationsMap.values()));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
