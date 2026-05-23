const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function GetServiceDetails(req, res) {
  try {
    const { id } = req.params;

    console.log(id);


    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const db = await connectDB();
    const collection = db.collection("services");

    const serviceDetails = await collection
      .aggregate([
        { $match: { _id: new ObjectId(id), status: "Active" } },
        {
          $lookup: {
            from: "categories",
            localField: "category_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      ])
      .toArray();

    console.log(serviceDetails);


    if (!serviceDetails.length) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service details fetched successfully",
      data: serviceDetails[0],
    });
  } catch (error) {
    console.error("GetServiceDetails.js: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { GetServiceDetails };
