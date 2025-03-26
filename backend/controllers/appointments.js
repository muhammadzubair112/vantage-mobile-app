const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Appointment = require('../models/Appointment');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = asyncHandler(async (req, res, next) => {
  // For admin users, get all appointments
  // For regular users, only get their own appointments
  let query;
  
  if (req.user.role === 'admin') {
    query = Appointment.find().populate('services');
  } else {
    query = Appointment.find({ user: req.user.id }).populate('services');
  }

  const appointments = await query;

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// @desc    Get appointments for current user
// @route   GET /api/appointments/user
// @access  Private
exports.getUserAppointments = asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.find({ user: req.user.id }).populate('services');

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id).populate('services');

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the appointment or is admin
  if (
    appointment.user &&
    appointment.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this appointment`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Public
exports.createAppointment = asyncHandler(async (req, res, next) => {
  // If user is logged in, add user ID to request body
  if (req.user) {
    req.body.user = req.user.id;
  }

  const appointment = await Appointment.create(req.body);

  res.status(201).json({
    success: true,
    data: appointment
  });
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the appointment or is admin
  if (
    appointment.user &&
    appointment.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this appointment`,
        401
      )
    );
  }

  appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the appointment or is admin
  if (
    appointment.user &&
    appointment.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this appointment`,
        401
      )
    );
  }

  await appointment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get available time slots for a date
// @route   GET /api/appointments/timeslots
// @access  Public
exports.getTimeSlots = asyncHandler(async (req, res, next) => {
  const { date } = req.query;

  if (!date) {
    return next(new ErrorResponse('Please provide a date', 400));
  }

  // Get all appointments for the given date
  const appointments = await Appointment.find({
    date,
    status: { $ne: 'cancelled' }
  });

  // Business hours from 9 AM to 5 PM
  const slots = [];
  const startHour = 9;
  const endHour = 17;
  
  // Generate 30-minute slots
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotId = `${date}-${time}`;
      
      // Check if slot is already booked
      const isBooked = appointments.some(app => app.timeSlot === slotId);
      
      slots.push({
        id: slotId,
        time,
        available: !isBooked
      });
    }
  }

  res.status(200).json({
    success: true,
    count: slots.length,
    data: slots
  });
});