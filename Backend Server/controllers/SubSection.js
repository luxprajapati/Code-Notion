const SubsectionModel = require("../models/SubsectionModel");
const SectionModel = require("../models/SectionModel");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { sectionId, title, description } = req.body;
    const video = req.files.video;

    // Check if all necessary fields are provided
    if (!sectionId || !title || !description || !video) {
      return res
        .status(404)
        .json({ success: false, message: "All Fields are Required" });
    }
    // console.log(video);

    // Upload the video file to Cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    // console.log(uploadDetails);
    // Create a new sub-section with the necessary information
    const SubSectionDetails = await SubsectionModel.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    // Update the corresponding section with the newly created sub-section
    const updatedSection = await SectionModel.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subsections: SubSectionDetails._id } },
      { new: true }
    ).populate("subsections");

    console.log(
      "createSubsection in subsection.js UpdatedSectionPrinting: -",
      updatedSection
    );
    // Return the updated section in the response
    return res.status(200).json({
      success: true,
      message: "Sub-section created successfully",
      data: updatedSection,
    });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating new sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body;
    const subSection = await SubsectionModel.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    // find updated section and return it
    const updatedSection =
      await SectionModel.findById(sectionId).populate("subsections");

    // console.log(
    //   "updatedsection in subsection.js updatedSectionPrinting",
    //   updatedSection
    // );

    return res.json({
      success: true,
      message: "SubSection updated successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
      error: error.message,
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await SectionModel.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubsectionModel.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    // find updated section and return it
    const updatedSection =
      await SectionModel.findById(sectionId).populate("subsections");

    // console.log(
    //   "deleteSubsection in subsection.js updatedSectionPrinting",
    //   updatedSection
    // );
    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
