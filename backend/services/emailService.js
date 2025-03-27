const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Use an App Password, not your regular password
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

/**
 * Send a verification email to a user
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (to, name, token) => {
  console.log('Preparing verification email for:', to);
  console.log('Using FRONTEND_URL:', process.env.FRONTEND_URL);
  
  // Generate both URLs
  const webUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${token}`;
  const appUrl = `exp://${process.env.FRONTEND_URL}/--/auth/verify-email/${token}`;
  
  console.log('Generated verification URL:', webUrl);
  
  const mailOptions = {
    from: `"Vantage App" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Vantage App!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with Vantage App. To complete your registration and verify your email address, please click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${webUrl}" 
             style="background-color: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If you're on your mobile device with the Vantage app installed, use this link instead:</p>
        <p><a href="${appUrl}" style="color: #007AFF; text-decoration: none;">${appUrl}</a></p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If you didn't create an account with Vantage App, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
      </div>
    `
  };

  console.log('Email configuration:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject
  });

  try {
    console.log('Attempting to send verification email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('SMTP Error Details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw error;
  }
};

/**
 * Send a password reset email to a user
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} token - Reset token
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
  
  const mailOptions = {
    from: `"Vantage App" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666;">${resetUrl}</p>
        <p>This password reset link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
}; 