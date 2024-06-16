const express = require("express");
const app = express();
require("dotenv").config();

const userRoute = require("./routes/UserRoute");
const profileRoute = require("./routes/ProfileRoute");
const courseRoute = require("./routes/CourseRoute");
const paymentRoute = require("./routes/PaymentRoute");
const contactRoute = require("./routes/ContactUsRoute");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 4000;

// Database connect
database.connect();
// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://code-notion-lux.vercel.app",
    credentials: true,
  })
);
// https://code-notion-ot9apjxkf-lux-prajapati.vercel.app

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Cloudinary Connect
cloudinaryConnect();

// routes
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/profile", profileRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/reach", contactRoute);

const server = app.listen(PORT, () => {
  console.log(`CodeNotion Server is running on PORT: ${PORT}`);
});

server.on("error", (err) => {
  console.log("Server Error: ", err);
});
