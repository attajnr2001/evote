const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");

// Get settings route
router.get("/", async (req, res) => {
  try {
    console.log("Get settings request received");

    const settings = await Settings.findOne();

    if (!settings) {
      return res.status(404).json({ message: "No settings found" });
    }

    console.log("Settings retrieved:", settings);

    res.status(200).json({
      message: "Settings retrieved successfully",
      settings: {
        startDateTime: settings.startDateTime,
        endDateTime: settings.endDateTime,
        votersAuthKey: settings.votersAuthKey,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Save settings route
router.post("/", async (req, res) => {
  try {
    console.log("Save settings request received");
    console.log("Request body:", req.body);

    const { startDateTime, endDateTime, votersAuthKey } = req.body;

    // Validate input
    if (!startDateTime || !endDateTime || !votersAuthKey) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate date times
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    if (start >= end) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      {},
      { startDateTime, endDateTime, votersAuthKey },
      { upsert: true, new: true }
    );

    console.log("Settings saved:", settings);

    res.status(200).json({
      message: "Settings saved successfully",
      settings: {
        startDateTime: settings.startDateTime,
        endDateTime: settings.endDateTime,
        votersAuthKey: settings.votersAuthKey,
      },
    });
  } catch (error) {
    console.error("Save settings error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
