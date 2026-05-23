const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function RescheduleBooking(req, res) {
  try {
    const { booking_id, new_datetime } = req.body;

    if (!booking_id || !ObjectId.isValid(booking_id)) {
      return res.status(400).json({ success: false, message: "Valid booking ID is required" });
    }
    
    if (!new_datetime) {
      return res.status(400).json({ success: false, message: "New booking datetime is required" });
    }

    const db = await connectDB();
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(booking_id),
      user_id: new ObjectId(req.user._id),
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cancelled bookings cannot be rescheduled" });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ success: false, message: "Completed bookings cannot be rescheduled" });
    }

    await db.collection("bookings").updateOne(
      { _id: new ObjectId(booking_id) },
      { $set: { booking_datetime: new Date(new_datetime), updated_at: new Date() } }
    );

    const user = await db.collection("users").findOne({ _id: new ObjectId(req.user._id) });
    const service = await db.collection("services").findOne({ _id: new ObjectId(booking.service_id) });
    if (user && service) {
      const { sendBookingReschedule } = require("../../utils/emailService");
      const updatedBooking = { ...booking, booking_datetime: new_datetime };
      sendBookingReschedule(user, service, updatedBooking).catch(console.error);
    }

    return res.status(200).json({ success: true, message: "Booking rescheduled successfully" });
  } catch (error) {
    console.error("RescheduleBooking.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { RescheduleBooking };
