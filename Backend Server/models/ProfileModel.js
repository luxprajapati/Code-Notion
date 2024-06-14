const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  dateOfBirth: {
    type: String,
  },
  about: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
  },
});

module.exports = mongoose.model("ProfileModel", profileSchema);
