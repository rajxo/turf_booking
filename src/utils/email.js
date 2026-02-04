const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * Uses environment variables for configuration
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Send booking confirmation email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - User's name
 * @param {Object} options.booking - Booking details
 * @param {Object} options.turf - Turf details
 */
const sendBookingConfirmation = async ({ to, userName, booking, turf }) => {
    try {
        const transporter = createTransporter();

        const formattedDate = new Date(booking.date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const mailOptions = {
            from: `"Turf Booking" <${process.env.EMAIL_USER}>`,
            to,
            subject: '🏟️ Booking Confirmed - Turf Booking',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .detail-row:last-child { border-bottom: none; }
                        .label { color: #666; font-weight: 500; }
                        .value { color: #333; font-weight: 600; }
                        .amount { font-size: 24px; color: #667eea; font-weight: bold; }
                        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
                        .success-icon { font-size: 48px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="success-icon">✅</div>
                            <h1>Booking Confirmed!</h1>
                        </div>
                        <div class="content">
                            <p>Hi <strong>${userName}</strong>,</p>
                            <p>Your turf booking has been confirmed. Here are your booking details:</p>
                            
                            <div class="booking-details">
                                <div class="detail-row">
                                    <span class="label">🏟️ Turf Name</span>
                                    <span class="value">${turf.name}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">📍 Location</span>
                                    <span class="value">${turf.location}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">📅 Date</span>
                                    <span class="value">${formattedDate}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">⏰ Time Slot</span>
                                    <span class="value">${booking.startTime} - ${booking.endTime}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">💰 Total Amount</span>
                                    <span class="value amount">₹${booking.totalAmount}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">📋 Booking ID</span>
                                    <span class="value">${booking._id}</span>
                                </div>
                            </div>
                            
                            <p>Please arrive 10 minutes before your scheduled time.</p>
                            <p>If you need to cancel your booking, please do so at least 2 hours before the slot time.</p>
                            
                            <div class="footer">
                                <p>Thank you for choosing Turf Booking!</p>
                                <p>This is an automated email. Please do not reply.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send booking cancellation email
 * @param {Object} options - Email options
 */
const sendBookingCancellation = async ({ to, userName, booking, turf }) => {
    try {
        const transporter = createTransporter();

        const formattedDate = new Date(booking.date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const mailOptions = {
            from: `"Turf Booking" <${process.env.EMAIL_USER}>`,
            to,
            subject: '❌ Booking Cancelled - Turf Booking',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .detail-row:last-child { border-bottom: none; }
                        .label { color: #666; font-weight: 500; }
                        .value { color: #333; font-weight: 600; }
                        .refund { font-size: 18px; color: #27ae60; font-weight: bold; }
                        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Booking Cancelled</h1>
                        </div>
                        <div class="content">
                            <p>Hi <strong>${userName}</strong>,</p>
                            <p>Your turf booking has been cancelled. Here are the details:</p>
                            
                            <div class="booking-details">
                                <div class="detail-row">
                                    <span class="label">🏟️ Turf Name</span>
                                    <span class="value">${turf.name}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">📅 Date</span>
                                    <span class="value">${formattedDate}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">⏰ Time Slot</span>
                                    <span class="value">${booking.startTime} - ${booking.endTime}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">💰 Refund Amount</span>
                                    <span class="value refund">₹${booking.totalAmount} (Refunded)</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">📋 Booking ID</span>
                                    <span class="value">${booking._id}</span>
                                </div>
                            </div>
                            
                            <p>Your refund will be processed within 5-7 business days.</p>
                            
                            <div class="footer">
                                <p>We hope to see you again!</p>
                                <p>This is an automated email. Please do not reply.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Booking cancellation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending booking cancellation email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendBookingConfirmation,
    sendBookingCancellation,
};
