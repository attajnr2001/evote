const express = require("express");
const Student = require("../models/Student");
const Candidate = require("../models/Candidate");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { indexNumber } = req.body;

    // Check if indexNumber is provided
    if (!indexNumber) {
      return res.status(400).json({ message: "Index number is required" });
    }

    // Find student by indexNumber
    const student = await Student.findOne({ indexNumber });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: "Invalid index number" });
    }

    // Check if student has already voted
    if (student.hasVoted) {
      return res.status(403).json({ message: "You have already voted" });
    }

    // Success: Student can proceed to vote
    res.status(200).json({
      message: "Login successful",
      student: {
        id: student._id,
        name: student.name,
        indexNumber: student.indexNumber,
        class: student.class,
        year: student.year,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ position: 1 });
    const groupedCandidates = {};

    // Group candidates by position
    candidates.forEach((candidate) => {
      if (!groupedCandidates[candidate.position]) {
        groupedCandidates[candidate.position] = [];
      }
      groupedCandidates[candidate.position].push({
        id: candidate._id,
        name: candidate.name,
        image: candidate.image,
      });
    });

    res.status(200).json(groupedCandidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/vote", async (req, res) => {
  try {
    const { studentId, votes } = req.body;

    // Validate input
    if (!studentId || !votes || typeof votes !== "object") {
      return res
        .status(400)
        .json({ message: "Student ID and votes are required" });
    }

    // Check if student exists and hasn't voted
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.hasVoted) {
      return res.status(403).json({ message: "You have already voted" });
    }

    // Validate and update votes
    for (const [position, candidateId] of Object.entries(votes)) {
      if (!candidateId) continue; // Skip if no candidate selected for this position
      const candidate = await Candidate.findById(candidateId);
      if (!candidate || candidate.position !== position) {
        return res
          .status(400)
          .json({ message: `Invalid candidate for ${position}` });
      }
      candidate.votes += 1;
      await candidate.save();
    }

    // Mark student as voted
    student.hasVoted = true;
    await student.save();

    res.status(200).json({ message: "Vote submitted successfully" });
  } catch (error) {
    console.error("Vote submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
