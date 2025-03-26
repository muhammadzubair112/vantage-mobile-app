const express = require('express');
const {
  getConversations,
  getConversation,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  createTeamChat
} = require('../controllers/messages');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router
  .route('/conversations')
  .get(getConversations)
  .post(createConversation);

router
  .route('/conversations/:id')
  .get(getConversation);

router
  .route('/conversations/:id/messages')
  .get(getMessages)
  .post(sendMessage);

router
  .route('/conversations/:id/read')
  .put(markAsRead);

router
  .route('/teamchat')
  .post(createTeamChat);

module.exports = router;