const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function AddFeedback(req, res) {
  try {
    const { booking_id, service_id, rating, feedback } = req.body;

    if (!booking_id || !service_id || !rating || !feedback) {
      return res.status(400).json({ success: false, message: "Booking ID, service ID, rating and feedback are required" });
    }

    if (!ObjectId.isValid(booking_id) || !ObjectId.isValid(service_id)) {
      return res.status(400).json({ success: false, message: "Invalid booking or service ID" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const db = await connectDB();
    
    // Check if feedback already exists for this booking
    const existingFeedback = await db.collection("feedbacks").findOne({
      booking_id: new ObjectId(booking_id)
    });

    if (existingFeedback) {
      return res.status(400).json({ success: false, message: "Feedback already submitted for this booking" });
    }

    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(booking_id),
      user_id: new ObjectId(req.user._id),
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    await db.collection("feedbacks").insertOne({
      user_id: new ObjectId(req.user._id),
      booking_id: new ObjectId(booking_id),
      service_id: new ObjectId(service_id),
      rating: parseFloat(rating),
      feedback,
      datetime: new Date(),
    });

    return res.status(201).json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("AddFeedback.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { AddFeedback };
