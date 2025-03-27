const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
exports.getTeams = asyncHandler(async (req, res, next) => {
  // For regular users, only return teams they are part of
  let query;
  
  if (req.user.role !== 'admin') {
    query = Team.find({ members: req.user._id });
  } else {
    query = Team.find();
  }

  const teams = await query;

  res.status(200).json({
    success: true,
    count: teams.length,
    data: teams
  });
});

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
exports.getTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(
      new ErrorResponse(`Team not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is team owner or member
  if (
    team.ownerId.toString() !== req.user.id &&
    !team.members.includes(req.user._id) &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this team`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: team
  });
});

// @desc    Create new team
// @route   POST /api/teams
// @access  Private
exports.createTeam = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.ownerId = req.user.id;
  req.body.members = [req.user.id];

  const team = await Team.create(req.body);

  // Update user with team ID and set role to admin
  await User.findByIdAndUpdate(
    req.user.id,
    { 
      teamId: team._id,
      role: 'team_admin'  // Set the team creator as team_admin
    },
    { new: true }  // Return the updated document
  );

  res.status(201).json({
    success: true,
    data: team
  });
});

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private/Admin
exports.updateTeam = asyncHandler(async (req, res, next) => {
  let team = await Team.findById(req.params.id);

  if (!team) {
    return next(
      new ErrorResponse(`Team not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is team owner
  if (team.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this team`,
        401
      )
    );
  }

  team = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: team
  });
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private/Admin
exports.deleteTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(
      new ErrorResponse(`Team not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is team owner, team_admin, or admin
  if (team.ownerId.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'team_admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this team`,
        401
      )
    );
  }

  // Update all team members to remove teamId
  await User.updateMany(
    { _id: { $in: team.members } },
    { $unset: { teamId: "" }, $set: { role: 'client' } }
  );

  // Delete the team
  await Team.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add team member
// @route   POST /api/teams/:id/members
// @access  Private/Admin
exports.addTeamMember = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(
      new ErrorResponse(`Team not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is team owner
  if (team.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this team`,
        401
      )
    );
  }

  // Check if user exists
  const user = await User.findOne({ phone: req.body.phone });

  if (!user) {
    return next(
      new ErrorResponse(`User with phone ${req.body.phone} not found`, 404)
    );
  }

  // Check if user is already in team
  if (team.members.includes(user._id)) {
    return next(
      new ErrorResponse(`User is already a member of this team`, 400)
    );
  }

  // Add user to team
  team.members.push(user._id);
  await team.save();

  // Update user with team ID
  await User.findByIdAndUpdate(user._id, { teamId: team._id, role: 'team_member' });

  res.status(200).json({
    success: true,
    data: team
  });
});

// @desc    Remove team member
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private/Admin
exports.removeTeamMember = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(
      new ErrorResponse(`Team not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is team owner
  if (team.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this team`,
        401
      )
    );
  }

  // Check if user is in team
  if (!team.members.includes(req.params.userId)) {
    return next(
      new ErrorResponse(`User is not a member of this team`, 400)
    );
  }

  // Cannot remove team owner
  if (team.ownerId.toString() === req.params.userId) {
    return next(
      new ErrorResponse(`Cannot remove team owner from team`, 400)
    );
  }

  // Remove user from team
  team.members = team.members.filter(
    member => member.toString() !== req.params.userId
  );
  await team.save();

  // Update user to remove teamId
  await User.findByIdAndUpdate(req.params.userId, { $unset: { teamId: "" } });

  res.status(200).json({
    success: true,
    data: team
  });
});