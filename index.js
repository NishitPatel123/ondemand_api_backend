const express = require("express");
const cors = require("cors");
const connectDB = require("./db/dbConnect");
const authMiddleware = require("./middleware/auth");
require("dotenv").config();

// ── Multer Instances ──────────────────────────────────────────────────────────
const { categoryUpload, serviceUpload, profileUpload } = require("./multer/multer");

// ── Common APIs ───────────────────────────────────────────────────────────────
const Logout = require("./apis/common/logout");
const Session = require("./apis/common/session");
const { Login } = require("./apis/common/login");
const { Signup } = require("./apis/common/signup");
const { ChangePassword } = require("./apis/common/changePassword");
const { SendOTP } = require("./apis/common/sendOTP");
const { VerifyOTP } = require("./apis/common/verifyOTP");

// ── Public APIs ───────────────────────────────────────────────────────────────
const { GetCategories } = require("./apis/user/GetCategories");
const { GetServices } = require("./apis/user/GetServices");
const { GetServiceDetails } = require("./apis/user/GetServiceDetails");
const { GetFeedbacks } = require("./apis/user/GetFeedbacks");

// ── User APIs ─────────────────────────────────────────────────────────────────
const { GetProfile } = require("./apis/user/GetProfile");
const { UpdateProfile } = require("./apis/user/UpdateProfile");
const { BookService } = require("./apis/user/BookService");
const { MyBookings } = require("./apis/user/MyBookings");
const { CancelBooking } = require("./apis/user/CancelBooking");
const { RescheduleBooking } = require("./apis/user/RescheduleBooking");
const { GenOrderId } = require("./apis/user/GenOrderId");
const { VerifyPayment } = require("./apis/user/VerifyPayment");
const { AddFeedback } = require("./apis/user/AddFeedback");

// ── Admin APIs ────────────────────────────────────────────────────────────────
const { GetUsers } = require("./apis/admin/GetUsers");
const { UpdateUserStatus } = require("./apis/admin/UpdateUserStatus");
const { AddCategory } = require("./apis/admin/AddCategory");
const { UpdateCategory } = require("./apis/admin/UpdateCategory");
const { DeleteCategory } = require("./apis/admin/DeleteCategory");
const { GetAdminCategories } = require("./apis/admin/GetCategories");
const { AddService } = require("./apis/admin/AddService");
const { UpdateService } = require("./apis/admin/UpdateService");
const { DeleteService } = require("./apis/admin/DeleteService");
const { GetAdminServices } = require("./apis/admin/GetServices");
const { GetBookings } = require("./apis/admin/GetBookings");
const { UpdateBooking } = require("./apis/admin/UpdateBooking");
const { GetPayments } = require("./apis/admin/GetPayments");
const { GetAdminFeedbacks } = require("./apis/admin/GetFeedbacks");
const { DeleteFeedback } = require("./apis/admin/DeleteFeedback");
const { DashboardStats } = require("./apis/admin/DashboardStats");

// ─────────────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://your-frontend.onrender.com", // ← replace with your actual frontend URL
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// ── Static File Serving ───────────────────────────────────────────────────────
app.use("/uploads/categories", express.static("uploads/categories"));
app.use("/uploads/services", express.static("uploads/services"));
app.use("/uploads/profiles", express.static("uploads/profiles"));

// ── DB Connect ────────────────────────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────────────────────────────────────
//  COMMON APIs
// ─────────────────────────────────────────────────────────────────────────────
app.post("/signup", Signup);
app.post("/login", Login);
app.get("/logout", Logout);
app.get("/session", Session);
app.post("/changePassword", ChangePassword);
app.post("/sendOTP", SendOTP);
app.post("/verifyOTP", VerifyOTP);

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC APIs (no auth required)
// ─────────────────────────────────────────────────────────────────────────────
const { DownloadInvoice } = require("./apis/common/DownloadInvoice");

app.get("/categories", GetCategories);
app.get("/services", GetServices);
app.get("/services/:id", GetServiceDetails);
app.get("/feedbacks", GetFeedbacks);
app.get("/downloadInvoice/:id", DownloadInvoice);

// ─────────────────────────────────────────────────────────────────────────────
//  USER APIs (JWT required)
// ─────────────────────────────────────────────────────────────────────────────
app.get("/user/profile", authMiddleware, GetProfile);
app.post("/user/updateProfile", authMiddleware, profileUpload.single("profile_image"), UpdateProfile);
app.post("/user/bookService", authMiddleware, BookService);
app.get("/user/myBookings", authMiddleware, MyBookings);
app.post("/user/cancelBooking", authMiddleware, CancelBooking);
app.post("/user/rescheduleBooking", authMiddleware, RescheduleBooking);
app.post("/user/genOrderId", authMiddleware, GenOrderId);
app.post("/user/verifyPayment", authMiddleware, VerifyPayment);
app.post("/user/addFeedback", authMiddleware, AddFeedback);

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN APIs (JWT required)
// ─────────────────────────────────────────────────────────────────────────────
app.get("/admin/users", authMiddleware, GetUsers);
app.post("/admin/updateUserStatus", authMiddleware, UpdateUserStatus);
app.post("/admin/addCategory", authMiddleware, categoryUpload.single("image"), AddCategory);
app.post("/admin/updateCategory", authMiddleware, categoryUpload.single("image"), UpdateCategory);
app.get("/admin/deleteCategory/:id", authMiddleware, DeleteCategory);
app.get("/admin/categories", authMiddleware, GetAdminCategories);
app.post("/admin/addService", authMiddleware, serviceUpload.single("image"), AddService);
app.post("/admin/updateService", authMiddleware, serviceUpload.single("image"), UpdateService);
app.get("/admin/deleteService/:id", authMiddleware, DeleteService);
app.get("/admin/services", authMiddleware, GetAdminServices);
app.get("/admin/bookings", authMiddleware, GetBookings);
app.post("/admin/updateBooking", authMiddleware, UpdateBooking);
app.get("/admin/payments", authMiddleware, GetPayments);
app.get("/admin/feedbacks", authMiddleware, GetAdminFeedbacks);
app.delete("/admin/deleteFeedback/:id", authMiddleware, DeleteFeedback);
app.get("/admin/dashboardStats", authMiddleware, DashboardStats);

app.get("/", (req, res) => {
  res.send("Welcome to On-Demand Service Platform API!");
});

// ── Multer / Upload Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "File too large" });
  }
  if (err && (err.message?.includes("Only image") || err.name === "MulterError")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error("Server error:", err);
  return res.status(500).json({ success: false, message: "Internal server error" });
});

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`✅ On-Demand Service Platform server started on PORT ${PORT}!`)
);
