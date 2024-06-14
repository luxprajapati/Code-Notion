const CategoryModel = require("../models/CategoryModel");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

exports.createCategory = async (req, res) => {
  try {
    //  Fetch the name & Description
    const { name, description } = req.body;
    //  Validation
    if (!name || !description) {
      if (!name) {
        return res.status(404).json({
          success: false,
          message: "Name is required",
        });
      }
      if (!description) {
        return res.status(404).json({
          success: false,
          message: "Description is required",
        });
      }
    }
    // Create Entry in DB
    const categoryDetails = await CategoryModel.create({
      name: name,
      description: description,
    });
    // console.log("Category Details", categoryDetails);
    return res.status(200).json({
      success: true,
      message: "Category created successfully [Category.js]",
    });
  } catch (err) {
    console.log("Error in creating the category [Category.js]");
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error in creating the category [Category.js]",
    });
  }
};

// getAllCategorys
exports.showAllCategories = async (req, res) => {
  try {
    const allCategory = await CategoryModel.find(
      {},
      {
        name: true,
        description: true,
      }
    ).populate("courses");
    // console.log("All Category", allCategory);
    res.status(200).json({
      success: true,
      message: "All Category returned successfully [Category.js]",
      data: allCategory,
    });
  } catch (err) {
    console.log("Error in getting all category [Category.js]");
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error in getting all category [Category.js]",
    });
  }
};

// Handler function for categoryPageDetails
// I want me to obsever these properly after the class {Pending}
// exports.categoryPageDetails = async (req, res) => {
//   try {
//     const { categoryId } = req.body;
//     const selectedCategory = await CategoryModel.findById(categoryId)
//       .populate({
//         path: "courses",
//         match: { isPublished: true },
//       })
//       .populate("ratingAndReviews")
//       .exec();
//     if (!selectedCategory) {
//       return res.status(404).json({
//         success: false,
//         message: "Data not found",
//       });
//     }
//     // Get courses for different category
//     const differentCategory = await CategoryModel.find({
//       _id: { $ne: categoryId }, // Get all the category courses except the current categpry course
//     })
//       .populate("courses")
//       .exec();

//     // Home Work :- Get Top courses
//     const topCourses = await CategoryModel.find({}).populate({
//       path: "courses",
//       options: {
//         sort: { rating: -1 },
//         limit: 8,
//       },
//     });

//     // Send the response
//     return res.status(200).json({
//       success: true,
//       message: "Category Page details fetched successfully [Category.js]",
//       data: {
//         selectedCategory,
//         differentCategory,
//         topCourses,
//       },
//     });
//   } catch (err) {
//     console.log("Error in getting category page details");
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "Error in getting category page details [Category.js]",
//     });
//   }
// };

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    // console.log("PRINTING CATEGORY ID: ", categoryId);
    // Get courses for the specified category
    const selectedCategory = await CategoryModel.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();

    //console.log("SELECTED COURSE", selectedCategory)
    // Handle the case when the category is not found
    if (!selectedCategory) {
      // console.log("Category not found.");
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    // Get courses for other categories
    const categoriesExceptSelected = await CategoryModel.find({
      _id: { $ne: categoryId },
    });
    let differentCategory = await CategoryModel.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();
    //console.log("Different COURSE", differentCategory)
    // Get top-selling courses across all categories
    const allCategories = await CategoryModel.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);
    // console.log("mostSellingCourses COURSE", mostSellingCourses)
    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
