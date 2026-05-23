const connectDB = require("../../db/dbConnect");

async function GetAdminServices(req, res) {
  try {
    const db = await connectDB();
    const services = await db.collection("services").aggregate([
      { $lookup: { from: "categories", localField: "category_id", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $sort: { created_at: -1 } },
    ]).toArray();

    return res.status(200).json({ success: true, message: "Services fetched successfully", data: services });
  } catch (error) {
    console.error("admin/GetServices.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { GetAdminServices };
