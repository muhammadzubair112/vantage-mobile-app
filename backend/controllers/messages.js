const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Team = require('../models/Team');

// @desc    Get all conversations for user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  let conversations;
  
  if (req.user.role === 'admin' || req.user.role === 'team_member') {
    // For admin/team users, get all conversations
    conversations = await Conversation.find();
  } else {
    // For clients, only get their conversations
    conversations = await Conversation.find({ clientId: req.user.id });
  }

  // For each conversation, get unread count
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conversation) => {
      const unreadCount = await Message.countDocuments({
        conversationId: conversation._id,
        read: false,
        isClient: true // Only count unread client messages for staff
      });

      return {
        ...conversation.toObject(),
        unreadCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversationsWithUnread
  });
});

// @desc    Get single conversation
// @route   GET /api/messages/conversations/:id
// @access  Private
exports.getConversation = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(
      new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is part of the conversation or is admin/team member
  if (
    conversation.clientId.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'team_member'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this conversation`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: conversation
  });
});

// @desc    Create new conversation
// @route   POST /api/messages/conversations
// @access  Private
exports.createConversation = asyncHandler(async (req, res, next) => {
  // If client is creating conversation, use their ID
  if (req.user.role === 'client') {
    req.body.clientId = req.user.id;
    req.body.clientName = req.user.name;
    req.body.clientCompany = req.user.companyName;
  }

  const conversation = await Conversation.create(req.body);

  res.status(201).json({
    success: true,
    data: conversation
  });
});

// @desc    Get messages for a conversation
// @route   GET /api/messages/conversations/:id/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(
      new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is part of the conversation or is admin/team member
  if (
    conversation.clientId.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'team_member'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this conversation`,
        401
      )
    );
  }

  const messages = await Message.find({ conversationId: req.params.id })
    .sort({ timestamp: 1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc    Send a message
// @route   POST /api/messages/conversations/:id/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(
      new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is part of the conversation or is admin/team member
  if (
    conversation.clientId.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'team_member'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this conversation`,
        401
      )
    );
  }

  // Determine if message is from client
  const isClient = req.user.role === 'client';

  // Create message
  const message = await Message.create({
    conversationId: req.params.id,
    senderId: req.user.id,
    senderName: req.user.name,
    text: req.body.text,
    isClient,
    isTeamChat: conversation.isTeamChat || false,
    read: !isClient // Staff messages are automatically read
  });

  // Update conversation with last message
  await Conversation.findByIdAndUpdate(req.params.id, {
    lastMessage: req.body.text,
    lastMessageTimestamp: Date.now()
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Mark conversation messages as read
// @route   PUT /api/messages/conversations/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(
      new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is part of the conversation or is admin/team member
  if (
    conversation.clientId.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'team_member'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this conversation`,
        401
      )
    );
  }

  // If user is client, mark staff messages as read
  // If user is staff, mark client messages as read
  const isClient = req.user.role === 'client';
  
  await Message.updateMany(
    { 
      conversationId: req.params.id,
      isClient: !isClient, // Mark messages from the other party as read
      read: false
    },
    { read: true }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Create team chat
// @route   POST /api/messages/teamchat
// @access  Private/Admin
exports.createTeamChat = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to create team chats`,
        401
      )
    );
  }

  // Check if team exists
  const team = await Team.findById(req.body.teamId);
  if (!team) {
    return next(
      new ErrorResponse(`Team not found with id of ${req.body.teamId}`, 404)
    );
  }

  // Check if team chat already exists
  let teamChat = await Conversation.findOne({
    teamId: req.body.teamId,
    isTeamChat: true
  });

  if (teamChat) {
    return res.status(200).json({
      success: true,
      data: teamChat
    });
  }

  // Create team chat
  teamChat = await Conversation.create({
    clientId: req.user.id, // Use admin as client ID
    clientName: `${team.name} Team Chat`,
    clientCompany: 'Team Chat',
    lastMessage: 'Welcome to the team chat!',
    lastMessageTimestamp: Date.now(),
    isTeamChat: true,
    teamId: team._id
  });

  // Create welcome message
  await Message.create({
    conversationId: teamChat._id,
    senderId: req.user.id,
    senderName: 'System',
    text: `Welcome to the ${team.name} team chat! This is where team members can collaborate.`,
    isClient: false,
    isTeamChat: true,
    read: true
  });

  res.status(201).json({
    success: true,
    data: teamChat
  });
});