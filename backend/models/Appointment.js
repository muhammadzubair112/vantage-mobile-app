const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'Please add a date']
  },
  timeSlot: {
    type: String,
    required: [true, 'Please add a time slot']
  },
  services: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Service',
      required: true
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  companyName: {
    type: String
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);