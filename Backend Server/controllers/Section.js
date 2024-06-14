const SectionModel = require("../models/SectionModel");
const CourseModel = require("../models/CourseModel");
const SubsectionModel = require("../models/SubsectionModel");

exports.createSection = async (req, res) => {
  try {
    // Extract the required properties from the request body
    const { sectionName, courseId } = req.body;

    // Validate the input
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    // Create a new section with the given name
    const newSection = await SectionModel.create({ sectionName });

    // Add the new section to the course's content array
    const updatedCourse = await CourseModel.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subsections",
        },
      })
      .exec();

    // console.log(
    //   "CreateSection in Section.js UpdatedCoursePrinting: -",
    //   updatedCourse
    // );
    // Return the updated course object in the response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE a section
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId, courseId } = req.body;
    const section = await SectionModel.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    const course = await CourseModel.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subsections",
        },
      })
      .exec();
    // console.log("section", section);
    // console.log("UpdateSection in Section.js CoursePrinting: -", course);
    res.status(200).json({
      success: true,
      message: "Section updated",
      data: course,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// DELETE a section
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;
    await CourseModel.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    });
    const section = await SectionModel.findById(sectionId);
    // console.log(sectionId, courseId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not Found",
      });
    }

    //delete sub section
    await SubsectionModel.deleteMany({ _id: { $in: section.subSection } });

    await SectionModel.findByIdAndDelete(sectionId);

    //find the updated course and return
    const course = await CourseModel.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subsections",
        },
      })
      .exec();

    // console.log("deleteSection in section.js coursePrinting: -", course);
    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal server error",
    });
  }
};
