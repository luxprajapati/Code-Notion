const { instance } = require("../config/razorpay");
const CourseModel = require("../models/CourseModel");
const UserModel = require("../models/UserModel");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollementEmail");
const { mailSender } = require("../utils/mailSender");
const mongoose = require("mongoose");
const CourseProgressModel = require("../models/CourseProgressModel");
const crypto = require("crypto");
require("dotenv").config();

// Capture the payment && initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;
  if (courses.length === 0) {
    return res.json({
      success: false,
      message: "No courses selected",
    });
  }
  if (userId === undefined) {
    return res.json({
      success: false,
      message: "User not found",
    });
  }

  let total_amount = 0;

  for (const course_id of courses) {
    // console.log("Course ID: -", typeof course_id);
    if (
      typeof course_id !== "string" ||
      !mongoose.Types.ObjectId.isValid(course_id)
    ) {
      return res.json({
        success: false,
        message: "Invalid course ID",
      });
    }
    let course;
    try {
      // Find course by its id
      course = await CourseModel.findById(course_id);
      // if course not found then return error
      if (!course) {
        return res.status(200).json({
          success: false,
          message: "Course not found",
        });
      }

      // Check if user is already enrolled in the course
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentEnrolled.includes(uid)) {
        return res.json({
          success: false,
          message: "You are already enrolled in this course",
        });
      }

      // Add course price to total amount
      total_amount += course.price;
    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Something went wrong",
        error: err.message,
      });
    }

    // Create Razorpay order
    let currency = "INR";
    const options = {
      amount: total_amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
    };

    try {
      // Initiate the payment using Razorpay
      const paymentResponse = await instance.orders.create(options);
      // console.log("paymentResponse: -", paymentResponse);

      // Send the payment response to the client
      return res.json({
        success: true,
        message: "Payment initiated",
        data: paymentResponse,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Could not initiate order",
        error: err.message,
      });
    }
  }
};

// Verify the payment and enroll the user in the course
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body?.courses;

  const userId = req.user.id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.json({
      success: false,
      message: "Invalid request! Please provide all the required details",
    });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;
  // console.log("Razorpay Secret:- ", process.env.RAZORPAY_SECRET);
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res);
    return res.status(200).json({
      success: true,
      message: "Payment Verified! [Payments.js]",
    });
  }

  res.status(400).json({
    success: false,
    message: "Payment Verification Failed! [Payments.js]",
  });
};

// Enroll students in the course
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: "Invalid request! Please provide all the Courses and User ID",
    });
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await CourseModel.findByIdAndUpdate(
        { _id: courseId },
        { $push: { studentEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(400).json({
          success: false,
          message: "Course not found",
        });
      }
      // console.log("Updated EnrolledCourse: -", enrolledCourse);

      const courseProgress = await CourseProgressModel.create({
        courseId: courseId,
        userId: userId,
        completedVideos: [],
      });

      // Find the Student and add the course to their list of enrolled courses
      const enrolledStudent = await UserModel.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );
      // console.log("Enrolled student: ", enrolledStudent);

      // Send email notification to the enrolled Student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );

      // console.log("Email Response: -", emailResponse.response);
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Failed to enrolled student in the course [Payments.js]",
        error: err.message,
      });
    }
  }
};

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    if (!orderId) {
      res.status(400).json({
        success: false,
        message: "Order ID not found",
      });
    }
    if (!paymentId) {
      res.status(400).json({
        success: false,
        message: "Payment ID not found",
      });
    }
    if (!amount) {
      res.status(400).json({
        success: false,
        message: "Amount not found",
      });
    }
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID not found",
      });
    }
  }

  try {
    const enrolledStudent = await UserModel.findById(userId);

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res.status(400).json({
      success: false,
      message: "Could not send email [payments.js]",
      error: error.message,
    });
  }
};
