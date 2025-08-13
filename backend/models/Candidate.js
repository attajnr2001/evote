const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  idNumber: {
    type: String,
    required: [true, "Candidate ID number is required"],
    validate: {
      validator: async function (value) {
        const Student = mongoose.model("Student");
        const student = await Student.findOne({ indexNumber: value });
        return !!student;
      },
      message: "ID number must match an existing student's index number",
    },
  },
  name: {
    type: String,
    required: [true, "Candidate name is required"],
    trim: true,
  },
  position: {
    type: String,
    required: [true, "Position is required"],
    trim: true,
  },
  year: {
    type: String,
    required: [true, "Year is required"],
    trim: true,
  },
  image: {
    type: String,
    required: [true, "Candidate image is required"],
    trim: true,
  },
  votes: {
    type: Number,
    default: 0,
    min: [0, "Votes cannot be negative"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model("Candidate", candidateSchema);
