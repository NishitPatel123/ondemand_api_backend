const { ObjectId } = require("mongodb");
const crypto = require("crypto");
const connectDB = require("../../db/dbConnect");

async function VerifyPayment(req, res) {
  try {
    const { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!booking_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "All payment fields are required" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature. Payment verification failed." });
    }

    const db = await connectDB();
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(booking_id),
      user_id: new ObjectId(req.user._id),
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    await db.collection("payments").insertOne({
      user_id: new ObjectId(req.user._id),
      booking_id: new ObjectId(booking_id),
      payment_type: "Razorpay",
      payment_date: new Date(),
      amount: booking.amount,
      transaction_id: razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      status: "Success",
    });

    await db.collection("bookings").updateOne(
      { _id: new ObjectId(booking_id) },
      { $set: { payment_status: "Success", updated_at: new Date() } }
    );

    // If booking was already confirmed or completed by the admin, send the payment receipt immediately
    if (booking.status === "Ongoing" || booking.status === "Completed") {
      const user = await db.collection("users").findOne({ _id: new ObjectId(req.user._id) });
      const service = await db.collection("services").findOne({ _id: booking.service_id });
      if (user && service) {
        const { sendPaymentReceipt } = require("../../utils/emailService");
        const paymentInfo = {
          transaction_id: razorpay_payment_id,
          razorpay_order_id,
          payment_date: new Date(),
          payment_type: "Razorpay",
          amount: booking.amount || service.price,
        };
        sendPaymentReceipt(user, service, booking, paymentInfo).catch(console.error);
      }
    }

    return res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("VerifyPayment.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { VerifyPayment };
