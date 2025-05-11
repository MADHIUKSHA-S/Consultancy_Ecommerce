// config/mailer.js
const nodemailer = require("nodemailer");

let transporter;

// Create transporter based on environment
if (process.env.NODE_ENV === "production") {
  // Production transporter (e.g., using SendGrid, AWS SES, etc.)
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  // Development transporter (using Ethereal for testing)
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL,
      pass: process.env.ETHEREAL_PASSWORD,
    },
  });
}

// Verify the transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log("Error with email transporter:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

module.exports = transporter;
