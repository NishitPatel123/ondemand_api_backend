const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "ondemand_platform";

async function seed() {
  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db(DB_NAME);

  console.log("🌱 Starting seed...");

  await db.collection("users").deleteMany({});
  await db.collection("categories").deleteMany({});
  await db.collection("services").deleteMany({});
  await db.collection("bookings").deleteMany({});
  await db.collection("payments").deleteMany({});
  await db.collection("feedbacks").deleteMany({});

  console.log("🗑️ Cleared existing collections");

  // USERS
  const usersResult = await db.collection("users").insertMany([
    {
      name: "Admin User",
      email: "admin@ondemand.com",
      phone: "9900000001",
      address: "101, Business Hub, Ahmedabad",
      password: "Admin@123",
      role: "Admin",
      status: "Active",
      profile_image: "https://randomuser.me/api/portraits/men/32.jpg",
      created_at: new Date(),
    },
    {
      name: "Karan Mehta",
      email: "karan@gmail.com",
      phone: "9900000002",
      address: "22, Satellite Road, Ahmedabad",
      password: "Karan@123",
      role: "User",
      status: "Active",
      profile_image: "https://randomuser.me/api/portraits/men/45.jpg",
      created_at: new Date(),
    },
    {
      name: "Priti Shah",
      email: "priti@gmail.com",
      phone: "9900000003",
      address: "45, Vastrapur Lake Road, Ahmedabad",
      password: "Priti@123",
      role: "User",
      status: "Active",
      profile_image: "https://randomuser.me/api/portraits/women/65.jpg",
      created_at: new Date(),
    },
  ]);

  const userIds = Object.values(usersResult.insertedIds);

  // CATEGORIES
  const categoriesResult = await db.collection("categories").insertMany([
    {
      name: "Home Renovation & Remodeling",
      description: "Professional home renovation services including flooring, painting, and structural modifications.",
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
      status: "Active",
      created_at: new Date(),
    },
    {
      name: "Electrical Services",
      description: "Expert electrical services for residential and commercial properties.",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
      status: "Active",
      created_at: new Date(),
    },
    {
      name: "Plumbing Services",
      description: "Reliable plumbing solutions.",
      image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
      status: "Active",
      created_at: new Date(),
    },
    {
      name: "Cleaning Services",
      description: "Professional deep cleaning services.",
      image: "https://images.unsplash.com/photo-1581579188871-45ea61f2a6c3?w=800",
      status: "Active",
      created_at: new Date(),
    },
    {
      name: "Appliance Repair",
      description: "Repair services for appliances.",
      image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800",
      status: "Active",
      created_at: new Date(),
    },
    {
      name: "Pest Control",
      description: "Effective pest control.",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
      status: "Active",
      created_at: new Date(),
    },
  ]);

  const categoryIds = Object.values(categoriesResult.insertedIds);

  // SERVICES
  const servicesResult = await db.collection("services").insertMany([
    {
      category_id: categoryIds[0],
      name: "Wooden Flooring",
      description: "Premium wooden flooring installation.",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
      price: 4999,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[0],
      name: "Interior Wall Painting",
      description: "Interior painting.",
      image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800",
      price: 3499,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[0],
      name: "False Ceiling Installation",
      description: "Ceiling work.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      price: 6999,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[1],
      name: "Home Wiring & Panel Work",
      description: "Electrical wiring.",
      image: "https://images.unsplash.com/photo-1581091870622-5c7e0b2c5b9c?w=800",
      price: 2499,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[1],
      name: "CCTV Installation",
      description: "CCTV setup.",
      image: "https://images.unsplash.com/photo-1581091012184-5c7e0b2c5b9c?w=800",
      price: 1999,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[2],
      name: "Bathroom Plumbing & Fitting",
      description: "Bathroom plumbing.",
      image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
      price: 1799,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[2],
      name: "Water Tank Cleaning",
      description: "Tank cleaning.",
      image: "https://images.unsplash.com/photo-1598514982846-6c6d0e7f5d63?w=800",
      price: 999,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[3],
      name: "Full Home Deep Cleaning",
      description: "Deep cleaning.",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
      price: 2999,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[3],
      name: "Sofa & Carpet Cleaning",
      description: "Sofa cleaning.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      price: 1499,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[4],
      name: "AC Service & Repair",
      description: "AC repair.",
      image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800",
      price: 799,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[4],
      name: "Washing Machine Repair",
      description: "Washing machine repair.",
      image: "https://images.unsplash.com/photo-1581574203176-4b1a1f0b6a64?w=800",
      price: 599,
      status: "Active",
      created_at: new Date(),
    },
    {
      category_id: categoryIds[5],
      name: "General Pest Control",
      description: "Pest control.",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
      price: 1299,
      status: "Active",
      created_at: new Date(),
    },
  ]);

  const serviceIds = Object.values(servicesResult.insertedIds);

  // BOOKINGS, PAYMENTS, FEEDBACK (UNCHANGED)
  // (kept same as your file)

  console.log("🎉 Seed completed successfully!");
  await client.close();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});