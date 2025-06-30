const Service = require("../model/service");
const Category = require("../model/category");
const SubCategory = require("../model/subCategory");
const mongoose = require("mongoose");

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

    // 🔒 Check for existing sort_order
    const existing = await Service.findOne({ sort_order: parseInt(sort_order) });
    if (existing) {
      return res.status(409).json({ message: "Sort order already exists" });
    }

    const newService = new Service({
      name,
      category,
      subCategories: Array.isArray(subCategories)
        ? subCategories
        : [subCategories],
      sort_order,
      min_price,
      max_price,
      profile: req.file ? `/uploads/${req.file.filename}` : undefined,
 // make sure field name is 'profile' if that's what you're sending from frontend
    });



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
    let {
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

    page = parseInt(page);
    limit = parseInt(limit);

    const match = {};

    // Search query on name or sort_order
    if (query) {
      const parsedSortOrder = parseInt(query);
      match.$or = [
        { name: { $regex: query, $options: "i" } },
        ...(isNaN(parsedSortOrder) ? [] : [{ sort_order: parsedSortOrder }]),
      ];
    }



    if (category) {
      match.category = new mongoose.Types.ObjectId(category);
    }

    if (subCategory) {
      match.subCategories = new mongoose.Types.ObjectId(subCategory);;
    }

    if (minPrice || maxPrice) {
      match.min_price = {};
      if (minPrice) match.min_price.$gte = parseFloat(minPrice);
      if (maxPrice) match.min_price.$lte = parseFloat(maxPrice);
    }

    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(dateTo);
    }

    const sortDir = sortOrder === "asc" || sortOrder === "ascend" ? 1 : -1;
    const sortFieldMap = {
      name: "name_lower",
      "category.name": "category.name",
      "subCategories.name": "subCategories.name",
      createdAt: "createdAt",
      sort_order: "sort_order",
    };
    const resolvedSortField = sortFieldMap[sortField] || "createdAt";

    const aggregate = Service.aggregate([
      { $match: match },
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
      {
        $addFields: {
          name_lower: { $toLower: "$name" },
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          [resolvedSortField]: sortDir,
        },
      },
    ]);

    const options = {
      page,
      limit,
    };

    const result = await Service.aggregatePaginate(aggregate, options);

    res.json({
      services: result.docs,
      total: result.totalDocs,
      currentPage: result.page,
      totalPages: result.totalPages,
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

    // If profile is uploaded
    if (req.file) {
      existingService.profile = `/uploads/${req.file.filename}`;
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