// services/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send verification email with OTP
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otp - One-time password
 * @returns {Promise<boolean>} - Success status
 */
const sendVerificationEmail = async (to, name, otp) => {
  try {
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_FROM || "noreply@yourapp.com"}>`,
      to,
      subject: "Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with our service. Please use the following OTP (One-Time Password) to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 12px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 13px; color: #888;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

/**
 * Send order cancellation email to user
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {Object} orderDetails - Order information
 * @returns {Promise<boolean>} - Success status
 */
const sendCancellationEmail = async (to, name, orderDetails) => {
  try {
    const mailOptions = {
      from: `"${process.env.STORE_NAME || "Your Store"}" <${
        process.env.EMAIL_FROM || "noreply@yourapp.com"
      }>`,
      to,
      subject: "Your Order Has Been Cancelled",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0;">Order Cancelled</h2>
            <p style="color: #777; font-size: 14px;">Order #${orderDetails.id
              .toString()
              .slice(-6)
              .toUpperCase()}</p>
          </div>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
            <p>Hello ${name},</p>
            <p>We're writing to confirm that your order has been cancelled as requested. Here's a summary of the cancelled order:</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #777;">Order ID:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 500;">#${orderDetails.id
                .toString()
                .slice(-6)
                .toUpperCase()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #777;">Order Date:</td>
              <td style="padding: 10px 0; text-align: right;">${
                orderDetails.date
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #777;">Items:</td>
              <td style="padding: 10px 0; text-align: right;">${
                orderDetails.items
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #777;">Total Amount:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">₹${orderDetails.amount.toFixed(
                2
              )}</td>
            </tr>
          </table>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
            <p>If you requested this cancellation, no further action is needed. If you didn't request this cancellation or have any questions about your order, please contact our customer service team immediately.</p>
            
            <p>If you've been charged for this order, a refund will be processed according to our refund policy. Please note that it may take 5-7 business days for the refund to appear in your account.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }" style="display: inline-block; background-color: #4a69bd; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Continue Shopping</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #777; text-align: center;">
            <p>If you have any questions, please contact our customer service team.</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    return false;
  }
};

// Export all email functions
export { sendVerificationEmail, sendCancellationEmail };
