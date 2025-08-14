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
        idNumber: candidate.idNumber,
        name: candidate.name,
        image: candidate.image,
        votes: candidate.votes,
        position: candidate.position,
        year: candidate.year,
      });
    });

    res.status(200).json(groupedResults);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/candidate/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json({
      id: candidate._id,
      idNumber: candidate.idNumber,
      name: candidate.name,
      position: candidate.position,
      year: candidate.year,
      image: candidate.image,
      votes: candidate.votes,
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update-candidate", upload.single("image"), async (req, res) => {
  try {
    const { idNumber, name, position, year } = req.body;
    const image = req.file;

    // Validate input
    if (!idNumber || !name || !position || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find candidate by ID
    const candidate = await Candidate.findById(req.body.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if another candidate exists with the same idNumber and position
    const existingCandidate = await Candidate.findOne({
      idNumber,
      position,
      _id: { $ne: req.body.id },
    });
    if (existingCandidate) {
      return res.status(400).json({
        message:
          "Another candidate already exists for this position with the same ID number",
      });
    }

    // Update candidate fields
    candidate.idNumber = idNumber;
    candidate.name = name;
    candidate.position = position;
    candidate.year = year;
    if (image) {
      // Delete old image if it exists
      const oldImagePath = path.join(__dirname, "../", candidate.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      candidate.image = `/Uploads/${image.filename}`;
    }

    // Save updated candidate
    await candidate.save();

    res.status(200).json({ message: "Candidate updated successfully" });
  } catch (error) {
    console.error("Error updating candidate:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.delete("/delete-candidate", async (req, res) => {
  try {
    const { candidateId } = req.body;

    // Validate input
    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    // Find candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Delete candidate
    await Candidate.deleteOne({ _id: candidateId });

    // Delete image file
    const imagePath = path.join(__dirname, "../", candidate.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/reset-votes", async (req, res) => {
  try {
    // Update all candidates to set votes to 0
    await Candidate.updateMany({}, { $set: { votes: 0 } });
    // Update all students to set hasVoted to false
    await Student.updateMany({}, { $set: { hasVoted: false } });

    res
      .status(200)
      .json({
        message:
          "All candidate votes and student voting status reset successfully",
      });
  } catch (error) {
    console.error("Error resetting votes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
