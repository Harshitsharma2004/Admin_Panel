const User = require("../model/user");
const Category = require("../model/category");
const SubCategory = require("../model/subCategory");
const Service = require("../model/service");
const Attribute = require("../model/attribute");

// GET /api/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount, categoryCount, subCategoryCount, serviceCount,attributeCount] = await Promise.all([
      User.countDocuments(),
      Category.countDocuments(),
      SubCategory.countDocuments(),
      Service.countDocuments(),
      Attribute.countDocuments(),
    ]);

    res.status(200).json({
      users: userCount,
      categories: categoryCount,
      subCategories: subCategoryCount,
      services: serviceCount,
      attributes: attributeCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};


// GET /api/stats/users-by-date
exports.getUsersByDate = async (req, res) => {
  try {
    const usersByDate = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      }
    ]);

    res.status(200).json(usersByDate);
  } catch (error) {
    console.error("Error fetching users by date:", error);
    res.status(500).json({ error: "Failed to fetch user stats by date" });
  }
};



exports.getCategoriesByDate = async (req, res) => {
  try {
    const categoriesByDate = await Category.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json(categoriesByDate);
  } catch (error) {
    console.error("Error fetching categories by date:", error);
    res.status(500).json({ error: "Failed to fetch category stats by date" });
  }
};


exports.getSubCategoriesByDate = async (req, res) => {
  try {
    const subCategoriesByDate = await SubCategory.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json(subCategoriesByDate);
  } catch (error) {
    console.error("Error fetching subcategories by date:", error);
    res.status(500).json({ error: "Failed to fetch subcategory stats by date" });
  }
};

exports.getServicesByDate = async (req, res) => {
  try {
    const servicesByDate = await Service.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json(servicesByDate);
  } catch (error) {
    console.error("Error fetching services by date:", error);
    res.status(500).json({ error: "Failed to fetch service stats by date" });
  }
};

