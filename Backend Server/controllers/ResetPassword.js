const UserModel = require("../models/UserModel");
const { mailSender } = require("../utils/mailSender");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Function to reset the password token
exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      });
    }
    const token = crypto.randomBytes(20).toString("hex");

    const updatedDetails = await UserModel.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true }
    );
    // console.log("DETAILS", updatedDetails);

    const url = `https://code-notion-lux.vercel.app/update-password/${token}`;

    await mailSender(
      email,
      "Password Reset",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );

    res.json({
      success: true,
      message:
        "Email Sent Successfully, Please Check Your Email to Continue Further",
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Enter all details",
      });
    }

    const existingUser = await UserModel.findOne({ token: token });
    if (!existingUser) {
      return res.json({
        success: false,
        message: "Token is invalid",
      });
    }

    if (existingUser.resetPasswordExpiry < Date.now()) {
      return res.status(500).json({
        success: false,
        message: "Token is no longer valid",
      });
    }

    if (password !== confirmPassword) {
      return res.status(500).json({
        success: false,
        message: "Password Don't match",
      });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const updatedUser = await UserModel.findOneAndUpdate(
      { token },
      {
        password: hashedPwd,
      },
      { new: true }
    );
    // console.log("Updated user after password change is", updatedUser);
    return res.status(200).json({
      success: true,
      message: "Password Changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting password",
    });
  }
};

// exports.resetPassword = async (req, res) => {
//   try {
//     const { password, confirmPassword, token } = req.body;

//     if (confirmPassword !== password) {
//       return res.json({
//         success: false,
//         message: "Password and Confirm Password Does not Match",
//       });
//     }
//     const userDetails = await UserModel.findOne({ token: token });
//     if (!userDetails) {
//       return res.json({
//         success: false,
//         message: "Token is Invalid",
//       });
//     }
//     if (!(userDetails.resetPasswordExpiry > Date.now())) {
//       return res.status(403).json({
//         success: false,
//         message: `Token is Expired, Please Regenerate Your Token`,
//       });
//     }
//     const encryptedPassword = await bcrypt.hash(password, 10);
//     await UserModel.findOneAndUpdate(
//       { token: token },
//       { password: encryptedPassword },
//       { new: true }
//     );
//     res.json({
//       success: true,
//       message: `Password Reset Successful`,
//     });
//   } catch (error) {
//     return res.json({
//       error: error.message,
//       success: false,
//       message: `Some Error in Updating the Password`,
//     });
//   }
// };
