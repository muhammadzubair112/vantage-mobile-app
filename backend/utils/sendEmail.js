const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a test account if we're in development
  let testAccount = await nodemailer.createTestAccount();

  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || testAccount.user,
      pass: process.env.SMTP_PASS || testAccount.pass
    }
  });

  // Message configuration
  const message = {
    from: `${process.env.FROM_NAME || 'Vantage Media'} <${process.env.FROM_EMAIL || 'noreply@vantagemedia.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Send email
  const info = await transporter.sendMail(message);

  // Log URL in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }

  return info;
};

module.exports = sendEmail; 