const JWT = require("jsonwebtoken");
// const UserModel = require("../models/UserModel");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token not Found",
        data: token,
      });
    }
    // console.log("Token: ", token);
    try {
      const decoded = await JWT.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      console.log("Invalid Token [auth.js]", err);
      return res.status(401).json({
        success: false,
        message: "Invalid Token",
      });
    }
    next();
  } catch (err) {
    console.log("Error while validating the Token [auth.js]");
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Error while validating the Token [auth.js]",
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this STUDENT Route",
      });
    }
    next();
  } catch (err) {
    console.log("Error while Authenticating the Student", err);
    return res.status(500).json({
      success: false,
      message: "Error while Authenticating the Student",
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this INSTRUCTOR Route",
      });
    }
    next();
  } catch (err) {
    console.log("Error while Authenticating the Instructor", err);
    return res.status(500).json({
      success: false,
      message: "Error while Authenticating the Instructor",
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this ADMIN Route",
      });
    }
    next();
  } catch (err) {
    console.log("Error while Authenticating the Admin", err);
    return res.status(500).json({
      success: false,
      message: "Error while Authenticating the Admin",
    });
  }
};
