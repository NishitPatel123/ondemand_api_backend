const connectDB = require("../../db/dbConnect");
const bcrypt = require('bcrypt');
async function ChangePassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    const db = await connectDB();
    const userCollection = db.collection("users");

    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword, updated_at: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("changePassword.js: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { ChangePassword };
