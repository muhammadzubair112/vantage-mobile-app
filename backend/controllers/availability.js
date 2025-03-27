const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Availability = require('../models/Availability');

// @desc    Get availability settings for the current user
// @route   GET /api/availability
// @access  Private
exports.getAvailability = asyncHandler(async (req, res, next) => {
  const { date } = req.query;
  
  if (!date) {
    return next(new ErrorResponse('Please provide a date', 400));
  }

  // Convert date string to Date object
  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0);

  const availability = await Availability.find({
    user: req.user.id,
    date: queryDate
  });

  res.status(200).json({
    success: true,
    data: availability
  });
});

// @desc    Set availability for a specific date
// @route   POST /api/availability
// @access  Private
exports.setAvailability = asyncHandler(async (req, res, next) => {
  const availabilityData = req.body.map(slot => {
    // Convert date string to Date object and set time to midnight
    const date = new Date(slot.date);
    date.setHours(0, 0, 0, 0);
    
    return {
      user: req.user.id,
      date: date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: true
    };
  });

  // Delete existing availability for the same dates
  const dates = availabilityData.map(slot => slot.date);
  await Availability.deleteMany({
    user: req.user.id,
    date: { $in: dates }
  });

  try {
    // Create new availability settings
    const availability = await Availability.create(availabilityData);

    // Return the created availability settings
    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error creating availability:', error);
    return next(new ErrorResponse('Failed to create availability settings', 400));
  }
});

// @desc    Delete availability for a specific date
// @route   DELETE /api/availability/:date
// @access  Private
exports.deleteAvailability = asyncHandler(async (req, res, next) => {
  const date = new Date(req.params.date);
  date.setHours(0, 0, 0, 0);

  const availability = await Availability.findOne({
    user: req.user.id,
    date: date
  });

  if (!availability) {
    return next(new ErrorResponse(`No availability found for date ${req.params.date}`, 404));
  }

  await availability.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 