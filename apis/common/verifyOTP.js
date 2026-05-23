const connectDB = require("../../db/dbConnect");

async function VerifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

    const db = await connectDB();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.resetOtpExpiry)) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // Verify successfully. Activate user
    await collection.updateOne({ _id: user._id }, { $set: { status: "Active", resetOtp: null, resetOtpExpiry: null } });
    return res.status(200).json({ success: true, message: "OTP verified successfully, account activated" });
  } catch (error) {
    console.error("verifyOTP Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
module.exports = { VerifyOTP };
