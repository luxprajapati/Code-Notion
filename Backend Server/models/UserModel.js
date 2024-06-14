const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  accountType: {
    type: String,
    enum: ["Admin", "Student", "Instructor"],
    required: true,
  },
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProfileModel",
    required: true, // Is this required?
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseModel",
    },
  ],
  image: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  resetPasswordExpiry: {
    type: Date,
  },
  courseProgress: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseProgressModel",
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  approved: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("UserModel", userSchema);
