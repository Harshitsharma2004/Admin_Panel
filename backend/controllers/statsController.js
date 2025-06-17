const User = require("../model/user");
const Category = require("../model/category");
const SubCategory = require("../model/subCategory");
const Service = require("../model/service");

// GET /api/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount, categoryCount, subCategoryCount, serviceCount] = await Promise.all([
      User.countDocuments(),
      Category.countDocuments(),
      SubCategory.countDocuments(),
      Service.countDocuments(),
    ]);

    res.status(200).json({
      users: userCount,
      categories: categoryCount,
      subCategories: subCategoryCount,
      services: serviceCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
