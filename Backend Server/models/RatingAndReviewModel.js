const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseModel",
    required: true,
    index: true,
  },
});

module.exports = mongoose.model("RatingAndReviewModel", ratingAndReviewSchema);
