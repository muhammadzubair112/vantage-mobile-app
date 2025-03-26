const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String
  },
  text: {
    type: String,
    required: [true, 'Please add a message text']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  isClient: {
    type: Boolean,
    default: false
  },
  isTeamChat: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Message', MessageSchema);