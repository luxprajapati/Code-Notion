const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  try {
    const options = { folder: folder };
    if (height) options.height = height;
    if (quality) options.quality = quality;
    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
  } catch (err) {
    console.log("Error in uploading image to cloudinary");
    console.log(err);
    throw err;
  }
};
