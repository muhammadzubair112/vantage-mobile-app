const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    match: [
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      'Please add a valid phone number'
    ]
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  role: {
    type: String,
    enum: ['client', 'team_member', 'team_admin', 'admin'],
    default: 'client'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  teamId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Team'
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpire;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpire;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(new Error('Error encrypting password'));
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  if (!process.env.JWT_EXPIRE) {
    throw new Error('JWT_EXPIRE is not defined');
  }

  try {
    return jwt.sign(
      { 
        id: this._id,
        role: this.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE
      }
    );
  } catch (err) {
    throw new Error('Error generating authentication token');
  }
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) {
    throw new Error('Password not found for user');
  }

  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    throw new Error('Error comparing passwords');
  }
};

// Generate and hash email verification token
UserSchema.methods.getEmailVerificationToken = function() {
  try {
    // Generate token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to emailVerificationToken field
    this.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Set expire
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

    return verificationToken;
  } catch (err) {
    throw new Error('Error generating email verification token');
  }
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
  try {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
  } catch (err) {
    throw new Error('Error generating password reset token');
  }
};

// Cascade delete appointments when a user is deleted
UserSchema.pre('remove', async function(next) {
  try {
    await this.model('Appointment').deleteMany({ user: this._id });
    next();
  } catch (err) {
    next(new Error('Error deleting user appointments'));
  }
});

// Reverse populate with virtuals
UserSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

module.exports = mongoose.model('User', UserSchema);