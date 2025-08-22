const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Candidate = require("../models/Candidate");
const xlsx = require("xlsx");
const router = express.Router();
const Position = require("../models/Position"); // Add Position model

const uploadsDir = path.join(__dirname, "../uploads");
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

router.post("/add-candidate", upload.single("image"), async (req, res) => {
  try {
    console.log("Add candidate request received");
    console.log("Request body:", req.body);
    console.log("File:", req.file);

    const { idNumber, name, position, year } = req.body;

    // Validate required fields
    if (!idNumber || !name || !position || !year) {
      return res
        .status(400)
        .json({ message: "ID number, name, position, and year are required" });
    }

    // Validate position exists
    const validPosition = await Position.findOne({ name: position });
    if (!validPosition) {
      return res.status(400).json({ message: "Invalid position" });
    }

    // Check for existing candidate
    const existingCandidate = await Candidate.findOne({ idNumber, position });
    if (existingCandidate) {
      return res.status(400).json({
        message: "Candidate already exists for this position",
      });
    }

    // Create new candidate
    const candidate = new Candidate({
      idNumber,
      name,
      position,
      year,
      image: req.file ? `/Uploads/${req.file.filename}` : null,
      votes: 0,
    });

    await candidate.save();
    console.log("Candidate created:", candidate);

    res.status(201).json({
      message: "Candidate added successfully",
      candidate: {
        id: candidate._id,
        idNumber: candidate.idNumber,
        name: candidate.name,
        position: candidate.position,
        year: candidate.year,
        image: candidate.image,
        votes: candidate.votes,
      },
    });
  } catch (error) {
    console.error("Add candidate error:", error);
    if (error.message === "Only JPEG/PNG images are allowed") {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      message: "Server error",
    });
  }
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
      return res.status(400).json({
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
    // Validate position exists
    const validPosition = await Position.findOne({ name: position });
    if (!validPosition) {
      return res.status(400).json({ message: "Invalid position" });
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

router.post("/students/delete", async (req, res) => {
  try {
    const { studentIds } = req.body;

    // Validate input
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "No student IDs provided" });
    }

    // Delete students by IDs
    const result = await Student.deleteMany({ _id: { $in: studentIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No students found to delete" });
    }

    res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} student(s)`,
    });
  } catch (error) {
    console.error("Error deleting students:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/candidates/delete", async (req, res) => {
  try {
    console.log("Delete candidates request received");
    console.log("Request body:", req.body);

    const { candidateIds } = req.body;

    // Validate input
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ message: "No candidate IDs provided" });
    }

    // Delete candidates by IDs
    const result = await Candidate.deleteMany({ _id: { $in: candidateIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No candidates found to delete" });
    }

    console.log("Candidates deleted:", result);

    res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} candidate(s)`,
    });
  } catch (error) {
    console.error("Delete candidates error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      message: "Server error",
    });
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

const storage2 = multer.memoryStorage();
const upload2 = multer({
  storage2,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files (.xlsx, .xls) are allowed"), false);
    }
  },
});

router.post("/add-voters", upload2.single("file"), async (req, res) => {
  try {
    console.log("Bulk add voters request received");

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const errors = [];
    const addedVoters = [];
    const skippedIndexNumbers = [];

    for (const row of data) {
      const name = row.name || row.Name || row.NAME;
      const indexNumber = row.indexNumber || row.IndexNumber || row.INDEXNUMBER;
      const studentClass = row.class || row.Class || row.CLASS;
      const year = row.year || row.Year || row.YEAR;

      // Validate row
      if (!name || !indexNumber || !studentClass || !year) {
        errors.push(`Missing data in row: ${JSON.stringify(row)}`);
        continue;
      }

      // Check if student already exists
      const existingStudent = await Student.findOne({ indexNumber });
      if (existingStudent) {
        skippedIndexNumbers.push(indexNumber);
        continue;
      }

      // Create new student
      const newStudent = new Student({
        name: name.toString().trim(),
        indexNumber: indexNumber.toString().trim(),
        class: studentClass.toString().trim(),
        year: year.toString().trim(),
        hasVoted: false,
      });

      await newStudent.save();
      addedVoters.push(indexNumber);
    }

    console.log("Bulk add voters result:", {
      addedVoters,
      skippedIndexNumbers,
      errors,
    });

    res.status(201).json({
      message: "Bulk voter addition completed",
      addedCount: addedVoters.length,
      skippedCount: skippedIndexNumbers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error adding bulk voters:", error);
    res.status(error.message.includes("voting setup period") ? 403 : 500).json({
      message: error.message || "Server error",
    });
  }
});

// Add position route
router.post("/add-position", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Position name is required" });
    }

    const existingPosition = await Position.findOne({ name });
    if (existingPosition) {
      return res.status(400).json({ message: "Position already exists" });
    }

    const position = new Position({ name });
    await position.save();

    res.status(201).json({ message: "Position added successfully", position });
  } catch (error) {
    console.error("Error adding position:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete position route
router.delete("/delete-position", async (req, res) => {
  try {
    const { positionId } = req.body;
    if (!positionId) {
      return res.status(400).json({ message: "Position ID is required" });
    }

    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Check if any candidates are associated with this position
    const candidates = await Candidate.find({ position: position.name });
    if (candidates.length > 0) {
      return res.status(400).json({
        message: "Cannot delete position with associated candidates",
      });
    }

    await Position.deleteOne({ _id: positionId });
    res.status(200).json({ message: "Position deleted successfully" });
  } catch (error) {
    console.error("Error deleting position:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch all positions route
router.get("/positions", async (req, res) => {
  try {
    const positions = await Position.find().sort({ name: 1 });
    res
      .status(200)
      .json(positions.map((pos) => ({ id: pos._id, name: pos.name })));
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
