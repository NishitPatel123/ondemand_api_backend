const connectDB = require("../../db/dbConnect");
const jwt = require("jsonwebtoken");

async function Login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Connect DB
    const db = await connectDB();
    const collection = db.collection("users");

    // Find user by email only
    const user = await collection.findOne({ email });

    // Check user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const bcrypt = require('bcrypt');
    let isPasswordValid = false;

    // Check if stored password is a bcrypt hash (starts with $2b$)
    const isHash = user.password && user.password.startsWith('$2b$');
    if (isHash) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Fallback to plain text match
      isPasswordValid = (password === user.password);

      // Auto-upgrade plain text to bcrypt hash
      if (isPasswordValid) {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          await collection.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
        } catch (e) {
          console.error("Failed to upgrade password hash:", e);
        }
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account verification
    if (user.status === "PendingVerification") {
      return res.status(401).json({
        success: false,
        message:
          "Your account is not verified. Please verify the OTP sent to your email.",
      });
    }

    // Check inactive account
    if (user.status === "Inactive") {
      return res.status(401).json({
        success: false,
        message:
          "Your account has been deactivated. Please contact support.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      userData: {
        session: user,
        isAuth: true,
      },
    });

  } catch (error) {
    console.error("login.js:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { Login };