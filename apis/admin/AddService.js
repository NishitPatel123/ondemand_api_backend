const { ObjectId } = require("mongodb");
const connectDB = require("../../db/dbConnect");

async function AddService(req, res) {
  try {
    const { category_id, name, description, price } = req.body;

    if (!category_id || !name || !description || !price) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!ObjectId.isValid(category_id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const db = await connectDB();
    const categoryExists = await db.collection("categories").findOne({ _id: new ObjectId(category_id) });

    if (!categoryExists) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const image = req.file ? `/uploads/services/${req.file.filename}` : "";

    await db.collection("services").insertOne({
      category_id: new ObjectId(category_id),
      name, description, image,
      price: parseFloat(price),
      status: "Active",
      created_at: new Date(),
    });

    return res.status(201).json({ success: true, message: "Service added successfully" });
  } catch (error) {
    console.error("AddService.js: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { AddService };
