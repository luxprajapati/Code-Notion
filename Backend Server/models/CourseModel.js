const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
  },
  courseDescription: {
    type: String,
    trim: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  whatYouWillLearn: {
    type: String,
    trim: true,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SectionModel",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReviewModel",
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  tags: {
    type: String,
  },
  categorys: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CategoryModel",
  },
  studentEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
  ],
  instructions: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
    default: "Draft",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CourseModel", courseSchema);
