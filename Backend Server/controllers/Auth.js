const UserModel = require("../models/UserModel");
const OTPModel = require("../models/OTPModel");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const ProfileModel = require("../models/ProfileModel");
const JWT = require("jsonwebtoken");
const { mailSender } = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdated");

require("dotenv").config();

// Function to send OTP to the user
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUserPresent = await UserModel.findOne({ email });
    // If user already exists with this email
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already exists with this email [Auth.js]",
      });
    }
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    // The OTP which generated should be the unique one and to check that we will find the OTP in the database
    let uniqueOtp = await OTPModel.findOne({ otp: otp });
    while (uniqueOtp) {
      // If the OTP is not unique then we will generate the OTP again
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      uniqueOtp = await OTPModel.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTPModel.create(otpPayload);
    // console.log("otpBody [Auth.js]", otpBody);
    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp: otp,
    });
  } catch (err) {
    console.log("Error in sending OTP to the user [Auth.js]");
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error in sending OTP to the user [Auth.js]",
    });
  }
};

// Function to signup the user
exports.signup = async (req, res) => {
  try {
    const {
      accountType,
      firstName,
      lastName,
      email,
      contactNumber,
      password,
      confirmPassword,
      otp,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "You're requested to Provide all the details",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Confirm Password",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const recentOtp = await OTPModel.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    if (recentOtp.length === 0) {
      return res.status(404).json({
        success: false,
        message: "OTP Not Found",
      });
    } else if (recentOtp[0].otp !== otp) {
      // console.log("OTP", otp);
      // console.log("Recent OTP", recentOtp[0].otp);
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Creating a new profile for the user bcz it is required in the user model as a reference to the profile model to store the additional details of the user
    const profileDetails = await ProfileModel.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    // Creating a new user
    const newUser = await UserModel.create({
      accountType,
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&length=1`,
    });

    // console.log("User Signed Up Successfully [Auth.js]");
    return res.status(200).json({
      success: true,
      message: "User Signed Up Successfully [Auth.js]",
      data: newUser,
    });
  } catch (err) {
    console.log("Error in signing up the user [Auth.js]");
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error in signing up the user  [Auth.js]",
    });
  }
};

// Function to login the user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      if (!email) {
        return res.status(403).json({
          success: false,
          message: "Email is required",
        });
      } else if (!password) {
        return res.status(403).json({
          success: false,
          message: "Password is required",
        });
      }
    }

    const userExist = await UserModel.findOne({ email })
      .populate("additionalDetails")
      .exec();
    if (!userExist) {
      return res.status(401).json({
        success: false,
        message: "User does not exist with this email",
      });
    }

    // If the user exists then we will compare the password
    if (await bcrypt.compare(password, userExist.password)) {
      const payload = {
        email: userExist.email,
        id: userExist._id,
        accountType: userExist.accountType,
      };
      // Creating a token for the user
      const token = JWT.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      userExist.token = token;
      userExist.password = undefined;
      res
        .cookie("userInfo", token, {
          expires: new Date(Date.now() + 72 * 3600000), // 72 hours-> 3 days
          httpOnly: true,
        })
        .status(200)
        .json({
          success: true,
          token: token,
          data: userExist,
          message: "Logged In Successfully",
        });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }
  } catch (err) {
    console.log("Login Failed [Auth.js]");
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Login Failed [Auth.js]",
    });
  }
};

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await UserModel.findById(req.user.id);
    // Get old password, new password from req.body
    const { oldPassword, newPassword } = req.body;
    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    // Validate new password and confirm new password
    // if (newPassword !== confirmNewPassword) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "The password and confirm password does not match",
    //   });
    // }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await UserModel.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      // console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      console.error("Error occurred while sending email [Auth.js]:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email [Auth.js]",
        error: error.message,
      });
    }

    // Send the Response
    // console.log("Password updated successfully [Auth.js]");
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password [Auth.js]",
      error: error.message,
    });
  }
};
