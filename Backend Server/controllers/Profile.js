const mongoose = require("mongoose");
const ProfileModel = require("../models/ProfileModel");
const UserModel = require("../models/UserModel");
const CourseModel = require("../models/CourseModel");
const CourseProgressModel = require("../models/CourseProgressModel");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");
require("dotenv").config();

// Handler function to update profile
// exports.updateProfile = async (req, res) => {
//   try {
//     // S1: Fetch the profile details
//     const { dateOfBirth = "", gender, about = "", contactNumber } = req.body;
//     const id = req.user.id;
//     // S2: Validation
//     if (!contactNumber || !gender) {
//       if (!contactNumber) {
//         return res.status(400).json({
//           success: false,
//           message: "Contact Number is required",
//         });
//       }
//       if (!gender) {
//         return res.status(400).json({
//           success: false,
//           message: "Gender is required",
//         });
//       }
//     }
//     // S3: Find Profile
//     const userDetail = await UserModel.findById(id);
//     const profileId = userDetail.additionalDetails;
//     const profileDetails = await ProfileModel.findById(profileId);
//     // S4: Update Profile
//     profileDetails.dateOfBirth = dateOfBirth;
//     profileDetails.about = about;
//     profileDetails.gender = gender;
//     profileDetails.contactNumber = contactNumber;
//     await profileDetails.save();

//     // S5: Send the response
//     return res.status(200).json({
//       success: true,
//       message: "Profile Updated Successfully [Profile.js]",
//       data: profileDetails,
//     });
//   } catch (err) {
//     console.log("Error in Updating Profile");
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "Error in Updating Profile [Profile.js]",
//     });
//   }
// };
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body;
    const id = req.user.id;

    // Find the profile by id
    const userDetails = await UserModel.findById(id);
    const profile = await ProfileModel.findById(userDetails.additionalDetails);

    const user = await UserModel.findByIdAndUpdate(id, {
      firstName,
      lastName,
    });
    await user.save();

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;
    profile.gender = gender;

    // Save the updated profile
    await profile.save();

    // Find the updated user details
    const updatedUserDetails = await UserModel.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Handlr function to delete the profile
// exports.deleteAccount = async (req, res) => {
//   try {
//     // Get Id of user
//     const id = req.user.id;
//     // Validate the Id
//     const userDetail = await UserModel.findById(id);
//     if (!userDetail) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     // Delete the profile
//     await ProfileModel.findByIdAndDelete({ _id: userDetail.additionalDetails });
//     // Now delete the user
//     await UserModel.findByIdAndDelete({ _id: id });
//     // ToDo: Remove the user from all the enrolled courses
//     await CourseModel.updateMany(
//       { enrolledUsers: id },
//       { $pull: { enrolledUsers: id } }
//     );
//     // Send the response
//     return res.status(200).json({
//       success: false,
//       message: "Profile Deleted Successfully [Profile.js]",
//     });
//   } catch (err) {
//     console.log("Error in deleting the profile");
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "Error in deleting the profile [Profile.js]",
//     });
//   }
// };
exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;
    // console.log(id);
    const user = await UserModel.findById({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Delete Assosiated Profile with the User
    await ProfileModel.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.additionalDetails),
    });
    for (const courseId of user.courses) {
      await CourseModel.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnroled: id } },
        { new: true }
      );
    }
    // Now Delete User
    await UserModel.findByIdAndDelete({ _id: id });
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
    await CourseProgressModel.deleteMany({ userId: id });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" });
  }
};

// Handler function to get all user Details
exports.getAllUserDetails = async (req, res) => {
  try {
    const id = await req.user.id;
    const userDetail = await UserModel.findById(id)
      .populate("additionalDetails")
      .exec(); // here we're populating because we want gender details from profile
    if (!userDetail) {
      return res.status(404).json({
        success: false,
        message: "User Not Found [Profile.js]",
      });
    }
    // Send the response
    // console.log("User Details Fetched Successfully [Profile.js]");
    return res.status(200).json({
      success: true,
      message: "User Details Fetched Successfully [Profile.js]",
      data: userDetail,
    });
  } catch (err) {
    console.log("Error in getting all user details");
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error in getting all user details [Profile.js]",
    });
  }
};

// Handler function to update display picture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log("Image [Profile.js]: ", image);
    const updatedProfile = await UserModel.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        image: image.secure_url,
      },
      { new: true }
    );

    // Send the response
    return res.status(200).json({
      success: true,
      message: "Display Picture Updated Successfully [Profile.js]",
      data: updatedProfile,
    });
  } catch (err) {
    console.log("Error in updating Display Picture ", err);
    res.status(500).json({
      success: false,
      message: "Error in updating Display Picture [Profile.js]",
    });
  }
};

// Handler function to get enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    let userDetails = await UserModel.findOne({ _id: userId })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subsections",
          },
        },
      })
      .exec();
    // console.log("User Details: ", userDetails);

    userDetails = userDetails.toObject();

    var SubsectionLength = 0;
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0;
      SubsectionLength = 0;
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subsections.reduce((acc, curr) => acc + parseInt(curr.duration), 0);
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        );
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subsections.length;
      }
      let courseProgressCount = await CourseProgressModel.findOne({
        courseId: userDetails.courses[i]._id,
        userId: userId,
      });
      courseProgressCount = courseProgressCount?.completedVideos.length;
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100;
      } else {
        const multiplier = Math.pow(10, 2);
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier;
      }
    }
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }
    // Send the response
    return res.status(200).json({
      success: true,
      message: "Enrolled Courses Fetched Successfully [Profile.js]",
      data: userDetails.courses,
    });
  } catch (err) {
    console.log("Error in getting enrolled courses: ", err);
    res.status(500).json({
      success: false,
      message: "Error in getting enrolled courses [Profile.js]",
    });
  }
};

// Handler function for instructor Dashboard
exports.instructorDashboard = async (req, res) => {
  try {
    // console.log("User Id of Instructor: ", req.user.id);
    const courseDetails = await CourseModel.find({ instructor: req.user.id });
    // console.log(
    //   "Course Details------------------------------------------------------------: ",
    //   courseDetails
    // );
    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentEnrolled.length;
      const totalRevenueGenerated =
        course.studentEnrolled.length * course.price;
      // creating a new object with required fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        totalStudentsEnrolled,
        totalRevenueGenerated,
      };
      return courseDataWithStats;
    });
    // Send the response
    return res.status(200).json({
      success: true,
      message: "Instructor Dashboard Fetched Successfully [Profile.js]",
      data: courseData,
    });
  } catch (err) {
    console.log("Error in getting instructor dashboard: ", err);
    res.status(500).json({
      success: false,
      message: "Error in getting instructor dashboard [Profile.js]",
    });
  }
};
