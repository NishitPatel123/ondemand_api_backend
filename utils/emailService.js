const nodemailer = require("nodemailer");

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

function getHeader(title) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #4caf50; text-align: center;">On-Demand Services</h2>
      <h3 style="color: #333; text-align: center; border-bottom: 2px solid #4caf50; padding-bottom: 10px;">${title}</h3>
  `;
}

const footer = `
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} On-Demand Services. All rights reserved.</p>
    </div>
`;

async function sendBookingConfirmation(user, service, booking) {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Booking Successful - On-Demand Services",
      html: `
        ${getHeader("Booking Successful")}
        <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
        <p style="font-size: 15px; color: #555;">Your service booking for <strong>${service.name}</strong> is confirmed for <strong>${new Date(booking.booking_datetime).toLocaleString()}</strong>.</p>
        
        <div style="background-color: #fff; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px dashed #4caf50; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h3 style="margin-top: 0; margin-bottom: 20px; color: #4caf50; text-align: center; font-size: 22px; letter-spacing: 1px;">Scheduling Report</h3>
          <table cellpadding="12" cellspacing="0" width="100%" style="font-size: 15px; text-align: left; background: #fafafa; border-radius: 6px; overflow: hidden; border: 1px solid #eee;">
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555; width: 40%;"><strong>Service Name:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333; font-weight: bold;">${service.name}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Status:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #2196f3; font-weight: bold;">${booking.status}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Scheduled Date:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333;">${new Date(booking.booking_datetime).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="color: #555;"><strong>Amount:</strong></td>
              <td style="color: #4caf50; font-weight: bold; font-size: 18px;">₹${booking.amount || service.price}</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 14px; color: #777; text-align: center;">You can manage your booking and make payments from your account dashboard.</p>
        ${footer}
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Error:", error);
  }
}

async function sendBookingUpdate(user, service, booking) {
  try {
    const transporter = createTransporter();
    const isCompleted = booking.status === "Completed";
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: isCompleted ? "Service Completed - On-Demand Services" : "Booking Confirmed & Updated - On-Demand Services",
      html: `
        ${getHeader(isCompleted ? "Service Completed" : "Booking Confirmed")}
        <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
        <p style="font-size: 15px; color: #555;">
          ${isCompleted 
            ? `Your service for <strong>${service.name}</strong> has been successfully completed.`
            : `Your service booking for <strong>${service.name}</strong> is confirmed for <strong>${new Date(booking.booking_datetime).toLocaleString()}</strong>.`
          }
        </p>
        
        <div style="background-color: #fff; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px dashed #4caf50; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h3 style="margin-top: 0; margin-bottom: 20px; color: #4caf50; text-align: center; font-size: 22px; letter-spacing: 1px;">Scheduling Report</h3>
          <table cellpadding="12" cellspacing="0" width="100%" style="font-size: 15px; text-align: left; background: #fafafa; border-radius: 6px; overflow: hidden; border: 1px solid #eee;">
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555; width: 40%;"><strong>Service Name:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333; font-weight: bold;">${service.name}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Status:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #2196f3; font-weight: bold;">${booking.status}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Scheduled Date:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333;">${new Date(booking.booking_datetime).toLocaleString()}</td>
            </tr>
            ${booking.start_datetime ? `
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Arrival Time:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333;">${new Date(booking.start_datetime).toLocaleString()}</td>
            </tr>` : ''}
            <tr>
              <td style="color: #555;"><strong>Amount:</strong></td>
              <td style="color: #4caf50; font-weight: bold; font-size: 18px;">₹${booking.amount || service.price}</td>
            </tr>
          </table>
          ${isCompleted ? `
          <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee;">
            <a href="https://ondemand-api-backend-m1v5.onrender.comdownloadInvoice/${booking._id}" style="background-color: #4caf50; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              Download Invoice PDF
            </a>
          </div>` : ''}
        </div>
        <p style="font-size: 14px; color: #777; text-align: center;">You can manage your booking and make payments from your account dashboard.</p>
        ${footer}
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Error:", error);
  }
}

async function sendBookingReschedule(user, service, booking) {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Booking Rescheduled - On-Demand Services",
      html: `
        ${getHeader("Booking Rescheduled")}
        <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
        <p style="font-size: 15px; color: #555;">Your booking for <strong>${service.name}</strong> has been successfully rescheduled.</p>
        <div style="background: #fff; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>New Date & Time:</strong> ${new Date(booking.booking_datetime).toLocaleString()}</p>
        </div>
        ${footer}
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Error:", error);
  }
}

async function sendBookingCancellation(user, service, booking) {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Booking Declined - On-Demand Services",
      html: `
        ${getHeader("Booking Declined")}
        <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
        <p style="font-size: 15px; color: #555;">We regret to inform you that your booking for <strong>${service.name}</strong> has been declined.</p>
        <div style="background: #fff; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336; margin: 20px 0;">
          <p style="margin: 5px 0; color: #d9534f; font-weight: bold;">Reason: Time slot is full, no worker is available.</p>
          <p style="margin: 5px 0;">If you have already made the payment, don't worry—you will receive your refund soon.</p>
        </div>
        <p style="font-size: 14px; color: #777;">We apologize for the inconvenience and hope to serve you another time!</p>
        ${footer}
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Error:", error);
  }
}

async function sendAdminNewBookingNotification(user, service, booking) {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_USER, // Admin Email
      subject: "New Service Booking Alert - On-Demand Services",
      html: `
        ${getHeader("New Booking Received")}
        <p style="font-size: 16px; color: #333;">Hello Admin,</p>
        <p style="font-size: 15px; color: #555;">A new service booking has been created on the platform.</p>
        
        <div style="background-color: #fff; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #ddd; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h3 style="margin-top: 0; margin-bottom: 20px; color: #333; font-size: 18px;">Booking Details:</h3>
          <table cellpadding="12" cellspacing="0" width="100%" style="font-size: 15px; text-align: left; background: #fafafa; border-radius: 6px; overflow: hidden; border: 1px solid #eee;">
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555; width: 40%;"><strong>Customer Name:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333; font-weight: bold;">${user.name} (${user.email})</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Service:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333; font-weight: bold;">${service.name}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Scheduled Date:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333;">${new Date(booking.booking_datetime).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Address:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333;">${booking.address}</td>
            </tr>
            <tr>
              <td style="color: #555;"><strong>Amount:</strong></td>
              <td style="color: #4caf50; font-weight: bold; font-size: 18px;">₹${booking.amount || service.price}</td>
            </tr>
          </table>
        </div>
        ${footer}
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Admin Email Error:", error);
  }
}

async function sendPaymentReceipt(user, service, booking, paymentInfo) {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Payment Receipt - On-Demand Services",
      html: `
        ${getHeader("Payment Receipt")}
        <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
        <p style="font-size: 15px; color: #555;">Thank you for your payment! Your transaction has been successfully processed.</p>
        
        <div style="background-color: #fff; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px dashed #4caf50; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h3 style="margin-top: 0; margin-bottom: 20px; color: #4caf50; text-align: center; font-size: 22px; letter-spacing: 1px;">Transaction Invoice</h3>
          <table cellpadding="12" cellspacing="0" width="100%" style="font-size: 15px; text-align: left; background: #fafafa; border-radius: 6px; overflow: hidden; border: 1px solid #eee;">
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555; width: 40%;"><strong>Service Booked:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333; font-weight: bold;">${service.name}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Transaction ID:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333; font-family: monospace;">${paymentInfo.transaction_id}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Order ID:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333; font-family: monospace;">${paymentInfo.razorpay_order_id}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Payment Date:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333;">${new Date(paymentInfo.payment_date).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #ddd; color: #555;"><strong>Payment Method:</strong></td>
              <td style="border-bottom: 1px solid #ddd; color: #333;">${paymentInfo.payment_type}</td>
            </tr>
            <tr>
              <td style="color: #555;"><strong>Amount Paid:</strong></td>
              <td style="color: #4caf50; font-weight: bold; font-size: 18px;">₹${paymentInfo.amount}</td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee;">
            <span style="background-color: #e8f5e9; color: #4caf50; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block;">
              Status: Paid Successfully
            </span>
          </div>
        </div>
        <p style="font-size: 14px; color: #777; text-align: center;">You can track this service's status and schedule from your account dashboard.</p>
        ${footer}
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Payment Receipt Email Error:", error);
  }
}

module.exports = {
  sendBookingConfirmation,
  sendBookingUpdate,
  sendBookingReschedule,
  sendBookingCancellation,
  sendAdminNewBookingNotification,
  sendPaymentReceipt
};
