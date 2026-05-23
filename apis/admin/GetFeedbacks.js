const connectDB = require("../../db/dbConnect");

async function GetAdminFeedbacks(req, res) {
  try {
    const db = await connectDB();
    const feedbacks = await db.collection("feedbacks").aggregate([
      { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "services", localField: "service_id", foreignField: "_id", as: "service" } },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "bookings", localField: "booking_id", foreignField: "_id", as: "booking" } },
      { $unwind: { path: "$booking", preserveNullAndEmptyArrays: true } },
      { $project: { "user.password": 0 } },
      { $sort: { datetime: -1 } },
    ]).toArray();

    return res.status(200).json({ success: true, message: "Feedbacks fetched successfully", data: feedbacks });
  } catch (error) {
    console.error("admin/GetFeedbacks.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { GetAdminFeedbacks };
