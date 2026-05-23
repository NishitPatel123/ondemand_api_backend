const { ObjectId } = require("mongodb");
const Razorpay = require("razorpay");
const connectDB = require("../../db/dbConnect");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function GenOrderId(req, res) {
  try {
    const { booking_id } = req.body;

    if (!booking_id || !ObjectId.isValid(booking_id)) {
      return res.status(400).json({ success: false, message: "Valid booking ID is required" });
    }

    const db = await connectDB();
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(booking_id),
      user_id: new ObjectId(req.user._id),
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.payment_status === "Success") {
      return res.status(400).json({ success: false, message: "Payment already completed for this booking" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(booking.amount * 100),
      currency: "INR",
      receipt: `receipt_${booking_id}`,
    });

    return res.status(200).json({ success: true, message: "Order created successfully", data: { order_id: order.id, amount: order.amount, currency: order.currency, booking_id } });
  } catch (error) {
    console.error("GenOrderId.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { GenOrderId };
