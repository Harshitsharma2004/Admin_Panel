const SubCategory = require("../model/subCategory");
const Category = require("../model/category");
const { default: mongoose } = require("mongoose");

exports.getAllSubCategories = async (req, res) => {
  try {
    const {
      name,
      category,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortField = "createdAt",
      sortOrder = "desc",
      query,
    } = req.query;

    const andConditions = {};

    if (query) {
      const parsedSortOrder = parseInt(query);

      andConditions.$or = [
        { name: { $regex: query, $options: 'i' } },
        ...(!isNaN(parsedSortOrder)
          ? [{ sort_order: parsedSortOrder }]
          : [])
      ];
    }


    if (category) {
      andConditions.category = new mongoose.Types.ObjectId(category);
    }

    if (dateFrom || dateTo) {
      andConditions.createdAt = {};
      if (dateFrom) andConditions.createdAt.$gte = new Date(dateFrom);
      if (dateTo) andConditions.createdAt.$lte = new Date(dateTo);
    }

    const filter = Object.keys(andConditions).length ? andConditions : {};


    const total = await SubCategory.countDocuments(filter);

    // Map frontend sort field to correct backend key
    let sortKey = sortField;
    if (sortField === "category.name") {
      sortKey = "category.name"; // Still match the field exactly
    }

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "eventcategories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "category.name": "$category.name", // Ensure the dot path works
        },
      },
      {
        $sort: {
          [sortKey]: sortOrder === "asc" ? 1 : -1,
        },
      },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    const subcategories = await SubCategory.aggregate(pipeline).collation({
      locale: "en",
      strength: 2,
    });


    res.json({
      subcategories,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



// Create SubCategory
exports.createSubCategory = async (req, res) => {


  try {

    console.log("Incoming body:", req.body);
    console.log("Incoming file:", req.file);
    const { name, sort_order, category } = req.body;
    const profile = req.file?.filename;

    // 🔒 Check for existing sort_order
    const existing = await SubCategory.findOne({ sort_order: parseInt(sort_order) });
    if (existing) {
      return res.status(409).json({ message: "Sort order already exists" });
    }

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const newSubCategory = new SubCategory({
      name,
      sort_order,
      category,
      profile,
    });

    await newSubCategory.save();

    res.status(201).json({ message: "SubCategory created", subcategory: newSubCategory });
  } catch (err) {
    console.error("Error creating subcategory:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update SubCategory
exports.updateSubCategory = async (req, res) => {

  console.log("Incoming File:", req.file);
  console.log("Body:", req.body);

  try {
    const { id } = req.params;
    const { name, sort_order, category } = req.body;
    const profile = req.file?.filename;

    const updatedFields = { name, sort_order, category };

    const existingSubCategory = await SubCategory.findById(id);
    if (!existingSubCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    // If sort_order is being changed, check for duplicate
    if (
      sort_order &&
      parseInt(sort_order) !== existingSubCategory.sort_order
    ) {
      const existingSort = await Service.findOne({ sort_order: parseInt(sort_order) });
      if (existingSort) {
        return res.status(409).json({ message: "Sort order already exists" });
      }
    }

    if (profile) updatedFields.profile = profile;

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    if (!updatedSubCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.json({ message: "SubCategory updated", subcategory: updatedSubCategory });
  } catch (err) {
    console.error("Error updating subcategory:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete SubCategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SubCategory.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.json({ message: "SubCategory deleted" });
  } catch (err) {
    console.error("Error deleting subcategory:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
