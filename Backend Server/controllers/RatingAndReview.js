const mongoose = require("mongoose");
const CourseModel = require("../models/CourseModel");
const RatingAndReviewModel = require("../models/RatingAndReviewModel");
// const UserModel = require("../models/UserModel");

exports.createRating = async (req, res) => {
  console.log("Request Body: ", req.user.id);
  try {
    const userId = req.user.id;
    // console.log("User ID: ", userId);
    const { courseId, rating, review } = req.body;
    // check if the user is enrolled in the course
    const courseDetails = await CourseModel.findOne({
      _id: courseId,
      studentEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "User is not enrolled in this course",
      });
    }
    // user has already given rating and review
    const alreadyReviewed = await RatingAndReviewModel.findOne({
      course: courseId,
      user: userId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "User has already given rating and review for this course",
      });
    }
    // Create the review and rating
    const newRatingAndReview = await RatingAndReviewModel.create({
      rating: rating,
      review: review,
      user: userId,
      course: courseId,
    });
    // Now update these rating review in course
    await CourseModel.findOneAndUpdate(
      {
        _id: courseId,
      },
      {
        $push: { ratingAndReviews: newRatingAndReview._id },
      },
      { new: true }
    );
    // Send the response
    return res.status(200).json({
      success: true,
      message: "Rating & Review created successfully  [RatingAndReview.js] ",
      data: newRatingAndReview,
    });
  } catch (err) {
    console.log("Error in creating Rating & Review: ", err);
    return res.status(500).json({
      success: false,
      message: "Error in creating Rating & Review [RatingAndReview.js] ",
    });
  }
};

// Handler Function to get Avg rating and reviews
exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId;
    // Calculate the Abg Rating and Reviews
    const avgRatingAndReviews = await RatingAndReviewModel.aggregrate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId), // Convert the courseId to ObjectId
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (avgRatingAndReviews.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Avg Rating and Reviews returned successfully",
        data: avgRatingAndReviews[0].avgRating,
      });
    } else {
      // review not exist
      return res.status(200).json({
        success: true,
        message: "No Rating for this course [RatingAndReview.js]",
        data: 0,
      });
    }
  } catch (err) {
    console.log("Sorry Not able to get Avg Rating and Reviews: ", err);
    return res.status(500).json({
      success: false,
      message: "Error in getting Avg Rating and Reviews",
    });
  }
};

// Handlere function to get all rating and reviews
exports.getAllRating = async (req, res) => {
  try {
    const allRatingAndReview = await RatingAndReviewModel.find({})
      .sort({
        rating: "desc",
      })
      .populate({
        path: "user", // Fix: Replace 'user' with a string representing the path to the user field
        select: "firstName lastName email image", // Select only required fields
      })
      .populate({
        path: "course", // Fix: Replace 'course' with a string representing the path to the course field
        select: "courseName",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Rating and Reviews returned successfully [RatingAndReview.js]",
      data: allRatingAndReview,
    });
  } catch (err) {
    console.log("Rating and Reviews not found: ", err);
    return res.status(500).json({
      success: false,
      message: "Error in getting Rating and Reviews [RatingAndReview.js]",
    });
  }
};
