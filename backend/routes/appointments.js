const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getTimeSlots
} = require('../controllers/appointments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.route('/timeslots').get(getTimeSlots);

// Protected routes
router.use(protect);

router
  .route('/')
  .get(getAppointments)
  .post(createAppointment);

router
  .route('/:id')
  .get(getAppointment)
  .put(updateAppointment)
  .delete(deleteAppointment);

module.exports = router;