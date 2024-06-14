const CourseModel = require("../models/CourseModel");
const CategoryModel = require("../models/CategoryModel");
const UserModel = require("../models/UserModel");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();
const { convertSecondsToDuration } = require("../utils/secToDuration");
const SectionModel = require("../models/SectionModel");
const SubsectionModel = require("../models/SubsectionModel");
// const CourseProgressModel = require("../models/CourseProgressModel");

// Create Course function handler
exports.createCourse = async (req, res) => {
  // console.log("create course backend call");
  try {
    // S1: Fetch the course details
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      categorys,
      tags,
      status,
      instructions,
    } = req.body;
    const thumbnail = req.files.thumbnailImage;
    // S2: Validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !categorys ||
      !thumbnail
    ) {
      if (!courseName) {
        return res.status(400).json({
          success: false,
          message: "Course Name is required",
        });
      }
      if (!courseDescription) {
        return res.status(400).json({
          success: false,
          message: "Course Description is required",
        });
      }
      if (!whatYouWillLearn) {
        return res.status(400).json({
          success: false,
          message: "What you will learn is required",
        });
      }
      if (!price) {
        return res.status(400).json({
          success: false,
          message: "Price is required",
        });
      }
      if (!categorys) {
        return res.status(400).json({
          success: false,
          message: "Categorys are required",
        });
      }
      if (!thumbnail) {
        return res.status(400).json({
          success: false,
          message: "Thumbnail is required",
        });
      }
    }

    // S3: Check if the user is an instructor
    const userId = req.user.id;
    const instructorDetail = await UserModel.findOne({ _id: userId });
    if (!instructorDetail) {
      return res.status(404).json({
        success: false,
        message: "Instructor Detail not found [Course.js]",
      });
    }
    // console.log("Instructor Details", instructorDetail);

    // S4: Check that the categorys are valid
    const categorysDetails = await CategoryModel.findById({ _id: categorys });
    if (!categorysDetails) {
      return res.status(404).json({
        success: false,
        message: "Categorys not found   [Course.js]",
      });
    }

    // S5: Upload the image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // S6: Create Entry for New Course in DB
    const newCourse = await CourseModel.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      categorys: categorys, // Category ID
      instructor: userId, // Instructor ID
      thumbnail: thumbnailImage.secure_url,
      tags,
      instructions,
      status,
    });

    // S7: User is instructor so we will add the course to the instructor's course list
    await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $push: { courses: newCourse._id },
      },
      {
        new: true,
      }
    );

    // S8: Update the categorys with the new course
    await CategoryModel.findOneAndUpdate(
      {
        _id: categorys,
      },
      {
        $push: { courses: newCourse._id },
      },
      { new: true }
    );
    // console.log("Course Created Successfully", newCourse);
    // S9: Send the response
    return res.status(200).json({
      success: true,
      message: "Course created successfully [Course.js]",
      newCourse,
    });
    //
  } catch (err) {
    console.log("Course creation Failed");
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Course creation Failed [Course.js]",
    });
  }
};

// get all courses functionhandler
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await CourseModel.find(
      {},
      {
        courseName: 1,
        courseDescription: 1,
        price: 1,
        thumbnailImage: 1,
        category: 1,
        instructor: 1,
        whatyouwillLearn: 1,
        ratingAndReviews: 1,
        studentEnrolled: 1,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "All Courses returned successfully [Course.js]",
      data: allCourses,
    });
  } catch (err) {
    console.log("Error in getting all courses");
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Error in getting all courses [Course.js]",
    });
  }
};

// Handler function to get course details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const courseDetails = await CourseModel.find({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate({
        path: "categorys",
      })
      .populate({
        path: "ratingAndReviews",
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subsections",
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Course not Found for id: - ${courseId}`,
      });
    }

    // Get the course duration {Pending}
    // console.log("GetCourseDetails: -", courseDetails);
    return res.status(200).json({
      success: true,
      message: "Course Details Fetched successfully [Course.js]",
      data: courseDetails,
    });
  } catch (err) {
    console.log("Not able to get Course Data: ", err);
    return res.status(500).json({
      success: false,
      message: "Not able to get Course Data [Course.js]",
    });
  }
};

// Handler function to edit the course
exports.editCourse = async (req, res) => {
  // console.log("Edit Course Backend Call: ", req.files);
  try {
    const { courseId } = req.body;
    const updates = req.body;
    const course = await CourseModel.findById(courseId);
    // console.log("Course: ", course);
    // console.log("Updates: ", updates);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    // console.log("Thumbnail Image: ", req.files.thumbnailImage);
    // Check for thumbnail image and if found then upload it to cloudinary
    if (req.files) {
      // console.log("Thumbnail Image Found");
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
      // console.log("Thumbnail Image Updated");
    }
    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instruction") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    // Now find the updated course and populate the fields
    const updatedCourse = await CourseModel.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("categorys")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subsections",
        },
      })
      .exec();

    // console.log("Course Updated Successfully: ", updatedCourse);
    // Send the response
    return res.status(200).json({
      success: true,
      message: "Course Updated Successfully [Course.js]",
      data: updatedCourse,
    });
  } catch (err) {
    console.log("Error in updating course: ", err);
    return res.status(500).json({
      success: false,
      message: "Error in updating course [Course.js]",
      error: err.message,
    });
  }
};

// Handler function  to getFullCourseDetails
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;
    const courseDetails = await CourseModel.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("categorys")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subsections",
        },
      })
      .exec();

    let courseProgressCount = await CourseModel.findOne({
      courseId: courseId,
      userId: userId,
    });
    // console.log("Course Progress Count: ", courseProgressCount);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Course not Found for id: - ${courseId}`,
      });
    }
    if (!courseDetails.status === "Draft") {
      // console.log("Course is not published yet, It is in Draft");
      return res.status(403).json({
        success: false,
        message: "Course is not published yet, It is in Draft",
      });
    }
    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subsections.forEach((subSectionContent) => {
        const timeDurationInSeconds = parseInt(subSectionContent.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);
    // Send the response
    return res.status(200).json({
      success: true,
      message: "Full Course Details Fetched successfully [Course.js]",
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    });
  } catch (err) {
    console.log("Error in getting full course details: ", err);
    return res.status(500).json({
      success: false,
      message: "Error in getting full course details [Course.js]",
    });
  }
};

// Handler function to get intructor course
exports.getInstrutorCourses = async (req, res) => {
  try {
    // Fetch the instructor id from the authenticated user
    const instructorId = req.user.id;
    // console.log("Instructor ID: -", instructorId);
    // Find all the courses of the instructor
    const instructorCourses = await CourseModel.find({
      instructor: instructorId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "courseContent",
        populate: {
          path: "subsections",
        },
      })
      .exec();

    // console.log("Instructor All Courses: -", instructorCourses);
    // Send the response
    return res.status(200).json({
      success: true,
      message: "Instructor Courses Fetched successfully [Course.js]",
      data: instructorCourses,
    });
  } catch (err) {
    console.log("Error in getting instructor courses: ", err);
    return res.status(500).json({
      success: false,
      message: "Error in getting instructor courses  [Course.js]",
      error: err.message,
    });
  }
};

// Handler function to delete the course
exports.deleteCourse = async (req, res) => {
  try {
    // Find the course
    const { courseId } = req.body;
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course Not found",
      });
    }

    // Now remove all the students from the course
    const enrolledStudents = course.studentEnrolled;
    for (let i = 0; i < enrolledStudents.length; i++) {
      const student = enrolledStudents[i];
      await UserModel.findByIdAndUpdate(
        { _id: student },
        { $pull: { courses: courseId } }
      );
    }
    // Delete the sections and subsection of the course
    const courseContent = course.courseContent;
    for (const sectionId of courseContent) {
      const section = await SectionModel.findById(sectionId);
      if (section) {
        const subsections = section.subsections;
        for (const subsectionId of subsections) {
          await SubsectionModel.findByIdAndDelete(subsectionId);
        }
      }
      await SectionModel.findByIdAndDelete(sectionId);
    }
    // Delete the course
    await CourseModel.findByIdAndDelete(courseId);
    // Send the response
    // console.log("Course Deleted Successfully");
    return res.status(200).json({
      success: true,
      message: "Course Deleted Successfully [Course.js]",
    });
  } catch (err) {
    console.log("Error in deleting course: ", err);
    return res.status(500).json({
      success: false,
      message: "Error in deleting course [Course.js]",
    });
  }
};
