const nodemailer = require("nodemailer");
require("dotenv").config();

exports.mailSender = async (email, subject, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: "Code Notion - Lux Prajapati", // sender address
      to: `${email}`, // address of the receiver
      subject: `${subject}`, // Subject line
      html: `${body}`, // plain text body
    });

    // console.log("Info", info);
    return info;
  } catch (err) {
    console.log("Error in sending mail [mailSender file]");
    console.log(err);
  }
};
