const connectDB = require("../../db/dbConnect");

async function GetFeedbacks(req, res) {
  try {
    const db = await connectDB();
    const collection = db.collection("feedbacks");

    const feedbacks = await collection
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "services",
            localField: "service_id",
            foreignField: "_id",
            as: "service",
          },
        },
        { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
        { $project: { "user.password": 0 } },
        { $sort: { datetime: -1 } },
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Feedbacks fetched successfully",
      data: feedbacks,
    });
  } catch (error) {
    console.error("GetFeedbacks.js: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { GetFeedbacks };
