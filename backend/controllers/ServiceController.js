const Service = require("../model/service");
const Category = require("../model/category");
const SubCategory = require("../model/subCategory");

// Create Service
exports.createService = async (req, res) => {


    try {
        const {
            name,
            category,
            subCategories,
            sort_order,
            min_price,
            max_price,
        } = req.body;

        const newService = new Service({
            name,
            category,
            subCategories: Array.isArray(subCategories)
                ? subCategories
                : [subCategories],
            sort_order,
            min_price,
            max_price,
            image: req.file?.path, // make sure field name is 'image' if that's what you're sending from frontend
        });

        // 🔒 Check for existing sort_order
        const existing = await Service.findOne({ sort_order: parseInt(sort_order) });
        if (existing) {
            return res.status(409).json({ message: "Sort order already exists" });
        }

        await newService.save();
        res.status(201).json({ message: "Service created successfully" });
    } catch (err) {
        console.error("Error creating service:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Get All Services
exports.getAllServices = async (req, res) => {
  try {
    const {
      name,
      category,
      subCategory,
      dateFrom,
      dateTo,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortField = "createdAt",
      sortOrder = "desc",
      query,
    } = req.query;

    const matchConditions = [];

    // Search query (on name or sort_order)
    if (query) {
      matchConditions.push({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { sort_order: parseInt(query) || -1 },
        ],
      });
    }

    // Name filter
    if (name) {
      matchConditions.push({
        name: { $regex: name, $options: "i" },
      });
    }

    // Category filter
    if (category) {
      matchConditions.push({ category });
    }

    // Subcategory filter
    if (subCategory) {
      matchConditions.push({ subCategories: subCategory });
    }

    // Price filter
    if (minPrice && maxPrice) {
      matchConditions.push({
        min_price: { $gte: parseFloat(minPrice) },
        max_price: { $lte: parseFloat(maxPrice) },
      });
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const dateRange = {};
      if (dateFrom) dateRange.$gte = new Date(dateFrom);
      if (dateTo) dateRange.$lte = new Date(dateTo);
      matchConditions.push({ createdAt: dateRange });
    }

    // Final match stage
    const matchStage = matchConditions.length ? { $and: matchConditions } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === "ascend" || sortOrder === "asc" ? 1 : -1;

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "eventcategories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategories",
          foreignField: "_id",
          as: "subCategories",
        },
      },
      { $unwind: "$category" },
      {
        $addFields: {
          name_lower: { $toLower: "$name" },
          category_name: "$category.name",
          subcategory_name: {
            $arrayElemAt: ["$subCategories.name", 0],
          },
        },
      },
      {
        $sort: {
          [sortField === "name"
            ? "name_lower"
            : sortField === "category.name"
            ? "category_name"
            : sortField === "subCategories.name"
            ? "subcategory_name"
            : sortField]: sortDirection,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: parseInt(limit) }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Service.aggregate(pipeline);

    const services = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    res.json({
      services,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};




// UPDATE SERVICE
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            category,
            subCategories,
            sort_order,
            min_price,
            max_price,
        } = req.body;

        const existingService = await Service.findById(id);
        if (!existingService) {
            return res.status(404).json({ message: "Service not found" });
        }

        // If sort_order is being changed, check for duplicate
        if (
            sort_order &&
            parseInt(sort_order) !== existingService.sort_order
        ) {
            const existingSort = await Service.findOne({ sort_order: parseInt(sort_order) });
            if (existingSort) {
                return res.status(409).json({ message: "Sort order already exists" });
            }
        }

        // Update the service fields
        existingService.name = name || existingService.name;
        existingService.category = category || existingService.category;
        existingService.subCategories = Array.isArray(subCategories)
            ? subCategories
            : subCategories
                ? [subCategories]
                : existingService.subCategories;
        existingService.sort_order = sort_order || existingService.sort_order;
        existingService.min_price = min_price || existingService.min_price;
        existingService.max_price = max_price || existingService.max_price;

        // If image is uploaded
        if (req.file?.path) {
            existingService.image = req.file.path;
        }

        await existingService.save();
        res.status(200).json({ message: "Service updated successfully", service: existingService });
    } catch (err) {
        console.error("Error updating service:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// DELETE SERVICE
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedService = await Service.findByIdAndDelete(id);
        if (!deletedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service deleted successfully" });
    } catch (err) {
        console.error("Error deleting service:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};