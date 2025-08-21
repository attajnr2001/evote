require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const studentRoute = require("./routes/student");
const adminRoute = require("./routes/admin");
const settingsRoute = require("./routes/settings");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://juass-evoting.onrender.com"],
  })
);
app.use(express.json());

// Serve static files (for images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
if (!process.env.MONGO_URL) {
  console.error("Error: MONGO_URL is not defined in .env file");
  process.exit(1);
}
connectDB();

app.use("/api/students", studentRoute);
app.use("/api/admins", adminRoute);
app.use("/api/settings", settingsRoute);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Artisan Hub API" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
