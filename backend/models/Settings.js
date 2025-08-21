const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  startDateTime: {
    type: Date,
    required: [true, "Start date and time are required"],
  },
  endDateTime: {
    type: Date,
    required: [true, "End date and time are required"],
    validate: {
      validator: function (value) {
        return this.startDateTime < value;
      },
      message: "End date must be after start date",
    },
  },
  votersAuthKey: {
    type: String,
    required: [true, "Voters authentication key is required"],
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` on save
settingsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Settings", settingsSchema);
