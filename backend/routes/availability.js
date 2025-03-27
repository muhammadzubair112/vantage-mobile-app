const express = require('express');
const {
  getAvailability,
  setAvailability,
  deleteAvailability
} = require('../controllers/availability');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect); // All availability routes are protected

router
  .route('/')
  .get(getAvailability)
  .post(setAvailability);

router.route('/:date').delete(deleteAvailability);

module.exports = router; 