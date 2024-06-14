const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
  },
  subsections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubsectionModel",
    },
  ],
});

module.exports = mongoose.model("SectionModel", sectionSchema);
