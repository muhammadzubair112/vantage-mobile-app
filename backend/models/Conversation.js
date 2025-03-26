const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientCompany: {
    type: String
  },
  lastMessage: {
    type: String
  },
  lastMessageTimestamp: {
    type: Date,
    default: Date.now
  },
  isTeamChat: {
    type: Boolean,
    default: false
  },
  teamId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Team'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Conversation', ConversationSchema);