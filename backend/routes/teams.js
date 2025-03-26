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

router.use(protect);

router
  .route('/')
  .get(getTeams)
  .post(authorize('admin'), createTeam);

router
  .route('/:id')
  .get(getTeam)
  .put(authorize('admin'), updateTeam)
  .delete(authorize('admin'), deleteTeam);

router
  .route('/:id/members')
  .post(authorize('admin'), addTeamMember);

router
  .route('/:id/members/:userId')
  .delete(authorize('admin'), removeTeamMember);

module.exports = router;