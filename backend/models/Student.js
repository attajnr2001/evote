const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  indexNumber: { type: String, required: true },
  class: { type: String, required: true },
  year: { type: String, required: true },
  hasVoted: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model("Student", studentSchema);