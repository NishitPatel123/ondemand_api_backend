const nodemailer = require("nodemailer");
const connectDB = require("../../db/dbConnect");

async function SendOTP(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const db = await connectDB();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await collection.updateOne({ _id: user._id }, { $set: { resetOtp: otp, resetOtpExpiry: otpExpiry } });

    // NodeMailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #4caf50; text-align: center;">On-Demand Services</h2>
          <p style="font-size: 16px; color: #333;">Hello ${user.name || "User"},</p>
          <p style="font-size: 16px; color: #333;">You have requested to reset your password. Use the following OTP to proceed:</p>
          <div style="background-color: #fff; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #4caf50;">
            <h1 style="margin: 0; color: #4caf50; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #777;">This OTP is valid for 10 minutes. If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} On-Demand Services. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendOTP Error:", error);
    // Don't leak the exact email error if it fails
    return res.status(500).json({ success: false, message: "Failed to send email. Check configuration." });
  }
}
module.exports = { SendOTP };
