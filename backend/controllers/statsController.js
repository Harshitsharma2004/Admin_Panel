const User = require("../model/user");
const Category = require("../model/category");
const SubCategory = require("../model/subCategory");
const Service = require("../model/service");
const Attribute = require("../model/attribute");
const SubAdmin = require("../model/user");
const Roles = require("../model/role");

// GET /api/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount, categoryCount, subCategoryCount, serviceCount, attributeCount,subAdminCount,roleCount] = await Promise.all([
      User.countDocuments(),
      Category.countDocuments(),
      SubCategory.countDocuments(),
      Service.countDocuments(),
      Attribute.countDocuments(),
      SubAdmin.countDocuments({ type: "SubAdmin" ,is_deleted:false }),
      Roles.countDocuments(),
    ]);
    
    res.status(200).json({
      users: userCount,
      categories: categoryCount,
      subCategories: subCategoryCount,
      services: serviceCount,
      attributes: attributeCount,
      subAdmins:subAdminCount,
      role:roleCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

