const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email
 * @param {Object} options - Email options { to, subject, html }
 * @returns {Promise}
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'ThreatMap <noreply@threatmap.com>',
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };
