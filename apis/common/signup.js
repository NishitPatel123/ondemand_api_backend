const connectDB = require('../../db/dbConnect');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

async function Signup(req, res) {
  try {
    const { name, email, phone, address, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const db = await connectDB();
    const userCollection = db.collection('users');

    // Check existing user
    const userExist = await userCollection.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExist) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone already exists',
      });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert User
    await userCollection.insertOne({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      role: 'User',
      status: 'PendingVerification',
      profile_image: '',
      resetOtp: otp,
      resetOtpExpiry: expiresAt,
      created_at: new Date(),
    });

    // Mail Transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Send Mail
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Your Registration OTP',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });

  } catch (error) {
    console.log('Signup Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}

module.exports = { Signup };