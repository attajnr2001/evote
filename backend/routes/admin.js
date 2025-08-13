const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Candidate = require("../models/Candidate");
const router = express.Router();

const uploadsDir = path.join(__dirname, "../Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow requests without files
    if (!file) {
      return cb(null, true);
    }
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG/PNG images are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });

    // Check if admin exists
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Success: Return admin details (excluding password)
    res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        timestamp: admin.timestamp,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalVoters = await Student.countDocuments();
    const voted = await Student.countDocuments({ hasVoted: true });
    const notVoted = totalVoters - voted;

    res.status(200).json({
      totalVoters,
      voted,
      notVoted,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add-candidate", upload.single("image"), async (req, res) => {
  try {
    const { idNumber, name, position, year } = req.body;
    const image = req.file;

    // Validate input
    if (!idNumber || !name || !position || !year || !image) {
      return res
        .status(400)
        .json({ message: "All fields are required, including an image" });
    }

    // Check if candidate already exists for this position and idNumber
    const existingCandidate = await Candidate.findOne({ idNumber, position });
    if (existingCandidate) {
      return res
        .status(400)
        .json({ message: "Candidate already exists for this position" });
    }

    // Create new candidate
    const newCandidate = new Candidate({
      idNumber,
      name,
      position,
      year,
      image: `/Uploads/${image.filename}`,
      votes: 0,
    });

    // Save candidate to database
    await newCandidate.save();

    res.status(201).json({ message: "Candidate added successfully" });
  } catch (error) {
    console.error("Error adding candidate:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/results", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ position: 1 });
    const groupedResults = {};

    // Group candidates by position
    candidates.forEach((candidate) => {
      if (!groupedResults[candidate.position]) {
        groupedResults[candidate.position] = [];
      }
      groupedResults[candidate.position].push({
        id: candidate._id,
        name: candidate.name,
        image: candidate.image,
        votes: candidate.votes,
      });
    });

    res.status(200).json(groupedResults);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
