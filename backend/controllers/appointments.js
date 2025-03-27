const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const integrationService = require('../services/integrationService');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = asyncHandler(async (req, res, next) => {
  let query;

  // If user is not admin, show only their appointments
  if (req.user.role !== 'admin') {
    query = Appointment.find({ user: req.user.id });
  } else {
    query = Appointment.find();
  }

  const appointments = await query.sort('-date');

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
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns appointment or is admin
  if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this appointment`, 401));
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc    Get available time slots for a given date
// @route   GET /api/appointments/timeslots
// @access  Public
exports.getTimeSlots = asyncHandler(async (req, res, next) => {
  const { date } = req.query;
  if (!date) {
    return next(new ErrorResponse('Please provide a date', 400));
  }

  // Get day of week (0-6, Sunday-Saturday)
  const dayOfWeek = new Date(date).getDay();

  // Get availability settings for this day
  const availability = await Availability.findOne({
    dayOfWeek,
    isAvailable: true
  });

  // If no availability set for this day, return empty array
  if (!availability) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  // Parse start and end times
  const [startHour, startMinute] = availability.startTime.split(':').map(Number);
  const [endHour, endMinute] = availability.endTime.split(':').map(Number);
  const slotDuration = 30; // minutes

  // Get existing appointments for the date
  const existingAppointments = await Appointment.find({
    date,
    status: { $ne: 'cancelled' }
  });

  const bookedSlots = existingAppointments.map(app => app.timeSlot);
  const availableSlots = [];

  // Generate time slots based on availability
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = (hour === startHour ? startMinute : 0); 
         minute < (hour === endHour ? endMinute : 60); 
         minute += slotDuration) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      if (!bookedSlots.includes(timeSlot)) {
        try {
          // Create a blank calendar event for the available slot
          await integrationService.createBlankCalendarEvent(date, timeSlot);
          availableSlots.push(timeSlot);
        } catch (error) {
          console.error(`Error creating calendar event for slot ${timeSlot}:`, error);
          // Still add the slot as available even if calendar creation fails
          availableSlots.push(timeSlot);
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    data: availableSlots
  });
});

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = asyncHandler(async (req, res, next) => {
  // Add user to req.body if authenticated
  if (req.user) {
    req.body.user = req.user.id;
  }

  // Check if slot is available
  const existingAppointment = await Appointment.findOne({
    date: req.body.date,
    timeSlot: req.body.timeSlot,
    status: { $ne: 'cancelled' }
  });

  if (existingAppointment) {
    return next(new ErrorResponse('This time slot is already booked', 400));
  }

  // Create appointment first
  const appointment = await Appointment.create(req.body);

  try {
    // Update calendar event and create Zoom meeting
    const { calendarEvent, zoomMeeting } = await integrationService.updateCalendarEvent(
      appointment.googleCalendarEventId,
      appointment
    );

    // Update appointment with integration details
    appointment.googleCalendarEventId = calendarEvent.id;
    appointment.zoomMeeting = {
      id: zoomMeeting.id,
      join_url: zoomMeeting.join_url,
      start_url: zoomMeeting.start_url,
      password: zoomMeeting.password
    };

    await appointment.save();
  } catch (error) {
    console.error('Integration error:', error);
    // Don't fail the appointment creation if integrations fail
  }

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
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns appointment or is admin
  if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this appointment`, 401));
  }

  // If status is being updated to cancelled, handle calendar event deletion
  if (req.body.status === 'cancelled' && appointment.googleCalendarEventId) {
    try {
      await integrationService.calendar.events.delete({
        calendarId: 'primary',
        eventId: appointment.googleCalendarEventId
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
    }
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
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns appointment or is admin
  if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this appointment`, 401));
  }

  // Delete calendar event if it exists
  if (appointment.googleCalendarEventId) {
    try {
      await integrationService.calendar.events.delete({
        calendarId: 'primary',
        eventId: appointment.googleCalendarEventId
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
    }
  }

  await appointment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});