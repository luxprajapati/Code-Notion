const mongoose = require("mongoose");
const { mailSender } = require("../utils/mailSender");
const otpTemplate = require("../mail/templates/emailVerificationTemplate");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60,
  },
});

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email From CodeNotion",
      otpTemplate(otp)
    );
    // console.log("Mail sent successfully [OTPModel]");
    // console.log("Mail Response", mailResponse);
  } catch (err) {
    console.log("Error in sending verification email [OTPModel]");
    console.log(err);
    throw err;
  }
}

otpSchema.pre("save", async function (next) {
  // console.log("Mail in pre hook: ", this.email);
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTPModel", otpSchema);
