const CourseProgressModel = require("../models/CourseProgressModel");
const SubsectionModel = require("../models/SubsectionModel");

// Handler function to update the course progress
exports.updateCourseProgress = async (req, res) => {
  console.log("Updating course Progress Entered!");
  try {
    const { courseId, subsectionId } = req.body;
    const userId = req.user.id;
    // console.log("Course ID: ", courseId);
    // console.log("Subsection ID: ", subsectionId);
    // console.log("User ID: ", userId);
    const subsection = await SubsectionModel.findById(subsectionId);
    if (!subsection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    let courseProgress = await CourseProgressModel.findOne({
      courseId: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress not found [CourseProgress.js]",
      });
    } else {
      if (courseProgress.completedVideos.includes(subsectionId)) {
        return res.status(200).json({
          success: false,
          message: "Subsection already completed",
        });
      }
      courseProgress.completedVideos.push(subsectionId);
    }
    await courseProgress.save();
    // console.log("Course progress updated successfully");
    // Send the response
    return res.status(200).json({
      success: true,
      message: "Course progress updated successfully [CourseProgress.js]",
    });
  } catch (err) {
    console.log("Error in updating course progress: ", err);
    return res.status(500).json({
      success: false,
      message: "Error in updating course progress [CourseProgress.js]",
    });
  }
};
