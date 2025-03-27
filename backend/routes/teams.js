const express = require('express');
const {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember
} = require('../controllers/teams');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Public routes (only require authentication)
router
  .route('/')
  .get(authorize('admin', 'team_admin'), getTeams)
  .post(createTeam);  // Any authenticated user can create a team

// Protected routes (require specific roles)
router
  .route('/:id')
  .get(getTeam)
  .put(authorize('admin', 'team_admin'), updateTeam)
  .delete(authorize('admin', 'team_admin'), deleteTeam);

router
  .route('/:id/members')
  .post(authorize('admin', 'team_admin'), addTeamMember);

router
  .route('/:id/members/:userId')
  .delete(authorize('admin', 'team_admin'), removeTeamMember);

module.exports = router;