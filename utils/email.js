const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBookingEmail = async ({ userEmail, userName, eventTitle, seatNumber, eventDate, eventTime, ticketCode, eventImage, eventLocation }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `🎫 Booking Confirmation: ${eventTitle}`,
            html: `
                <div style="background-color: #f6f9fc; padding: 20px 10px; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                    <div style="max-width: 480px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #eef2f5;">
                        <!-- Event Photo at the start -->
                        ${eventImage ? `
                        <div style="width: 100%; height: 200px; overflow: hidden;">
                            <img src="${eventImage}" alt="${eventTitle}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                        </div>
                        ` : ''}
                        
                        <!-- Header Gradient -->
                        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 25px 30px; text-align: center; color: white;">
                            <h3 style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #c7d2fe;">Your Booking is Confirmed</h3>
                            <h1 style="margin: 5px 0 0; font-size: 22px; font-weight: 800; line-height: 1.2; color: #ffffff;">Enjoy the Event!</h1>
                        </div>
                        <!-- Ticket Body -->
                        <div style="padding: 25px; box-sizing: border-box;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <span style="background: #eef2f6; color: #374151; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Official Entry Pass</span>
                            </div>
                            
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #111827; font-weight: 700; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px; text-align: center;">
                                ${eventTitle}
                            </h2>

                            <!-- Ticket details table (Info) - Fixed layout & responsive wrapping -->
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; table-layout: fixed;">
                                <tr>
                                    <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: 500; width: 35%; vertical-align: top;">Attendee</td>
                                    <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right; width: 65%; word-break: break-word; vertical-align: top;">${userName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: 500; width: 35%; vertical-align: top;">Email ID</td>
                                    <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right; width: 65%; word-break: break-all; vertical-align: top;">${userEmail}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: 500; width: 35%; vertical-align: top;">Seat Number</td>
                                    <td style="padding: 8px 0; font-size: 15px; color: #4f46e5; font-weight: 700; text-align: right; width: 65%; word-break: break-word; vertical-align: top;">${seatNumber || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: 500; width: 35%; vertical-align: top;">Location</td>
                                    <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right; width: 65%; word-break: break-word; vertical-align: top;">${eventLocation || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: 500; width: 35%; vertical-align: top;">Event Date</td>
                                    <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right; width: 65%; word-break: break-word; vertical-align: top;">${eventDate}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: 500; width: 35%; vertical-align: top;">Event Time</td>
                                    <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right; width: 65%; word-break: break-word; vertical-align: top;">${eventTime}</td>
                                </tr>
                            </table>

                            <!-- Dotted Ticket Line -->
                            <div style="border-top: 2px dashed #e5e7eb; margin: 25px 0;"></div>

                            <!-- Booking/Ticket Code & QR Code at the bottom -->
                            <div style="text-align: center; padding: 25px 20px; background: #fafafa; border-radius: 12px; border: 1px solid #f0f0f0;">
                                <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px;">Ticket Code</div>
                                <div style="font-size: 16px; font-family: monospace; font-weight: bold; color: #1f2937; letter-spacing: 1px; margin-bottom: 20px; word-break: break-all;">
                                    ${ticketCode}
                                </div>
                                <!-- Scan QR Code section -->
                                <div style="margin: 0 auto; width: 150px; height: 150px; background: #ffffff; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticketCode)}" alt="Ticket QR Code" style="width: 100%; height: 100%; display: block;" />
                                </div>
                                <div style="font-size: 11px; color: #9ca3af; margin-top: 10px;">Scan at the entrance for quick entry</div>
                            </div>
                        </div>
                        <!-- Footer -->
                        <div style="background: #fcfdfe; padding: 20px 40px; text-align: center; border-top: 1px solid #f3f4f6;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">Please show this email/ticket at the venue entrance.</p>
                            <p style="margin: 5px 0 0; font-size: 12px; font-weight: 600; color: #4f46e5;">Eventora Team</p>
                        </div>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('Booking email sent successfully to', userEmail);
    } catch (error) {
        console.error('Error sending booking email:', error);
    }
};

const sendOTPEmail = async (userEmail, otp, type) => {
    try {
        let title, msg;
        if (type === 'account_verification') {
            title = 'Verify your Eventora Account';
            msg = 'Please use the following OTP to verify your new Eventora account.';
        } else if (type === 'password_reset') {
            title = 'Reset your Eventora Password';
            msg = 'Please use the following OTP to reset your Eventora account password.';
        } else {
            title = 'Eventora Booking Verification';
            msg = 'Please use the following OTP to verify and confirm your event booking.';
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: title,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${userEmail} for ${type}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
};

module.exports = { sendBookingEmail, sendOTPEmail };