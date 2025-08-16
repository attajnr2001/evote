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
  fs.mkdirSync(UploadsDir, { recursive: true });
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
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Admin login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
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

// Change admin password route
router.put("/change-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Validate input
    if (!email || !currentPassword || !newPassword) {
      return res
        .status(400)
        .json({
          message: "Email, current password, and new password are required",
        });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Stats route
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

// Add candidate route
router.post("/add-candidate", upload.single("image"), async (req, res) => {
  try {
    const { idNumber, name, position, year } = req.body;
    const image = req.file;
    if (!idNumber || !name || !position || !year || !image) {
      return res
        .status(400)
        .json({ message: "All fields are required, including an image" });
    }
    const existingCandidate = await Candidate.findOne({ idNumber, position });
    if (existingCandidate) {
      return res
        .status(400)
        .json({ message: "Candidate already exists for this position" });
    }
    const newCandidate = new Candidate({
      idNumber,
      name,
      position,
      year,
      image: `/Uploads/${image.filename}`,
      votes: 0,
    });
    await newCandidate.save();
    res.status(201).json({ message: "Candidate added successfully" });
  } catch (error) {
    console.error("Error adding candidate:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// Fetch results route
router.get("/results", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ position: 1 });
    const groupedResults = {};
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

// Fetch single candidate route
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

// Update candidate route
router.put("/update-candidate", upload.single("image"), async (req, res) => {
  try {
    const { idNumber, name, position, year } = req.body;
    const image = req.file;
    if (!idNumber || !name || !position || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const candidate = await Candidate.findById(req.body.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
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
    candidate.idNumber = idNumber;
    candidate.name = name;
    candidate.position = position;
    candidate.year = year;
    if (image) {
      const oldImagePath = path.join(__dirname, "../", candidate.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      candidate.image = `/Uploads/${image.filename}`;
    }
    await candidate.save();
    res.status(200).json({ message: "Candidate updated successfully" });
  } catch (error) {
    console.error("Error updating candidate:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// Delete candidate route
router.delete("/delete-candidate", async (req, res) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    await Candidate.deleteOne({ _id: candidateId });
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

// Reset votes route
router.put("/reset-votes", async (req, res) => {
  try {
    await Candidate.updateMany({}, { $set: { votes: 0 } });
    await Student.updateMany({}, { $set: { hasVoted: false } });
    res.status(200).json({
      message:
        "All candidate votes and student voting status reset successfully",
    });
  } catch (error) {
    console.error("Error resetting votes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch all students route
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.status(200).json(
      students.map((student) => ({
        id: student._id,
        name: student.name,
        indexNumber: student.indexNumber,
        class: student.class,
        year: student.year,
        hasVoted: student.hasVoted,
        timestamp: student.timestamp,
      }))
    );
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add voter route
router.post("/add-voter", async (req, res) => {
  try {
    const { name, indexNumber, class: studentClass, year } = req.body;

    // Validate input
    if (!name || !indexNumber || !studentClass || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ indexNumber });
    if (existingStudent) {
      return res
        .status(400)
        .json({ message: "Student with this index number already exists" });
    }

    // Create new student
    const newStudent = new Student({
      name,
      indexNumber,
      class: studentClass,
      year,
      hasVoted: false,
    });

    // Save student to database
    await newStudent.save();

    res.status(201).json({ message: "Voter added successfully" });
  } catch (error) {
    console.error("Error adding voter:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = router;
