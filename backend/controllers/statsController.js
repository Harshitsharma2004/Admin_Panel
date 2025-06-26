const User = require("../model/user");
const Category = require("../model/category");
const SubCategory = require("../model/subCategory");
const Service = require("../model/service");
const Attribute = require("../model/attribute");
const SubAdmin = require("../model/sub_admin");
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
      SubAdmin.countDocuments(),
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


// // GET /api/stats/users-by-date
// exports.getUsersByDate = async (req, res) => {
//   try {
//     const { filter = "weekly", startDate, endDate } = req.query;

//     let matchStage = {};
//     if (startDate && endDate) {
//       matchStage.createdAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }

//     let groupFormat;
//     switch (filter) {
//       case "weekly":
//         groupFormat = "%Y-%U"; // Year-Week number
//         break;
//       case "monthly":
//         groupFormat = "%Y-%m"; // Year-Month
//         break;
//       case "quarterly":
//         groupFormat = null;
//         break;
//       default:
//         groupFormat = "%Y-%U";
//     }

//     const pipeline = [];

//     // Step 1: Filter by date range
//     if (Object.keys(matchStage).length > 0) {
//       pipeline.push({ $match: matchStage });
//     }

//     // Step 2: Group by format
//     if (filter === "quarterly") {
//       pipeline.push(
//         {
//           $group: {
//             _id: {
//               year: { $year: "$createdAt" },
//               quarter: {
//                 $ceil: { $divide: [{ $month: "$createdAt" }, 3] }
//               }
//             },
//             count: { $sum: 1 }
//           }
//         },
//         {
//           $sort: { "_id.year": 1, "_id.quarter": 1 }
//         },
//         {
//           $project: {
//             _id: 0,
//             label: {
//               $concat: [
//                 { $toString: "$_id.year" },
//                 "-Q",
//                 { $toString: "$_id.quarter" }
//               ]
//             },
//             count: 1
//           }
//         }
//       );
//     } else {
//       pipeline.push(
//         {
//           $group: {
//             _id: {
//               $dateToString: {
//                 format: groupFormat,
//                 date: "$createdAt"
//               }
//             },
//             count: { $sum: 1 }
//           }
//         },
//         {
//           $sort: { _id: 1 }
//         },
//         {
//           $project: {
//             _id: 0,
//             label: "$_id",
//             count: 1
//           }
//         }
//       );
//     }

//     const usersByDate = await User.aggregate(pipeline);

//     res.status(200).json(usersByDate);
//   } catch (error) {
//     console.error("Error fetching users by date:", error);
//     res.status(500).json({ error: "Failed to fetch user stats by date" });
//   }
// };


// exports.getCategoriesByDate = async (req, res) => {
//   try {
//     const categoriesByDate = await Category.aggregate([
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//           },
//           count: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id",
//           count: 1,
//         },
//       },
//     ]);

//     res.status(200).json(categoriesByDate);
//   } catch (error) {
//     console.error("Error fetching categories by date:", error);
//     res.status(500).json({ error: "Failed to fetch category stats by date" });
//   }
// };


// exports.getSubCategoriesByDate = async (req, res) => {
//   try {
//     const subCategoriesByDate = await SubCategory.aggregate([
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//           },
//           count: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id",
//           count: 1,
//         },
//       },
//     ]);

//     res.status(200).json(subCategoriesByDate);
//   } catch (error) {
//     console.error("Error fetching subcategories by date:", error);
//     res.status(500).json({ error: "Failed to fetch subcategory stats by date" });
//   }
// };

// exports.getServicesByDate = async (req, res) => {
//   try {
//     const servicesByDate = await Service.aggregate([
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//           },
//           count: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id",
//           count: 1,
//         },
//       },
//     ]);

//     res.status(200).json(servicesByDate);
//   } catch (error) {
//     console.error("Error fetching services by date:", error);
//     res.status(500).json({ error: "Failed to fetch service stats by date" });
//   }
// };

