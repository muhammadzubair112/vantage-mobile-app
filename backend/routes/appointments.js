const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUserAppointments,
  getTimeSlots
} = require('../controllers/appointments');

const router = express.Router();

const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getAppointments)
  .post(createAppointment);

router
  .route('/timeslots')
  .get(getTimeSlots);

router
  .route('/user')
  .get(protect, getUserAppointments);

router
  .route('/:id')
  .get(getAppointment)
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

module.exports = router;