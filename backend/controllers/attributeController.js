const Attribute = require('../model/attribute');
const mongoose = require('mongoose')

// Create Attribute
exports.createAttribute = async (req, res) => {
  try {
    const {
      name,
      category,
      service,
      sort_order,
      is_required = false,
      is_active = false,
      type
    } = req.body;

    let attributeOptions = req.body.options || req.body['options[]'];

    const requiresOptions = ["Radio", "Checkbox"]; // or include "Button" if you really need

    if (!name || !category || !service || !sort_order || !type) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (requiresOptions.includes(type) && !attributeOptions) {
      return res.status(400).json({ message: "Options are required for this type." });
    }


    if (!Array.isArray(attributeOptions)) {
      attributeOptions = [attributeOptions];
    }

    const existing = await Attribute.findOne({
      service,
      sort_order: parseInt(sort_order),
    });

    if (existing) {
      return res.status(409).json({ message: "Sort order already exists for this service." });
    }

    const newAttribute = new Attribute({
      name,
      category,
      service,
      sort_order: parseInt(sort_order),
      is_required,
      is_active,
      type,
      ...(requiresOptions.includes(type) && { attribute_name: attributeOptions }),
    });


    await newAttribute.save();
    res.status(201).json({ message: "Attribute created successfully.", data: newAttribute });
  } catch (err) {
    console.error("Error creating attribute:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Attribute
exports.updateAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      service,
      sort_order,
      is_required,
      is_active,
      type,
    } = req.body;

    // Parse the sort_order from request body
    const parsedSortOrder = parseInt(sort_order);

    // Fetch the existing attribute
    const existingAttribute = await Attribute.findById(id);
    console.log("Attribute ID:", id);  // Log the incoming ID


    if (!existingAttribute) {
      return res.status(404).json({ message: "Attribute not found." });
    }

    // Check if the sort_order is changing
    if (parsedSortOrder !== existingAttribute.sort_order) {
      // If sort_order is changing, check for conflicts with the new sort_order
      const existing = await Attribute.findOne({
        _id: { $ne: id },  // Exclude the current attribute being updated
        service,
        sort_order: parsedSortOrder,
      });

      if (existing) {
        return res.status(409).json({ message: "Sort order already exists for this attribute." });
      }
    }

    // Proceed with the update if no conflict or sort_order hasn't changed
    const updated = await Attribute.findByIdAndUpdate(
      id,
      {
        name,
        category,
        service,
        sort_order: parsedSortOrder, // Update sort_order
        is_required,
        is_active,
        type,
      },
      { new: true }
    );

    res.json({ message: "Attribute updated successfully.", data: updated });
  } catch (err) {
    console.error("Error updating attribute:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Delete Attribute
exports.deleteAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Attribute.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Attribute not found." });
    }

    res.json({ message: "Attribute deleted successfully." });
  } catch (err) {
    console.error("Error deleting attribute:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Attributes with Filters and Pagination
exports.getAllAttributes = async (req, res) => {
  try {
    const {
      name,
      category,
      service,
      type,
      is_active,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortField = 'createdAt',
      sortOrder = 'desc',
      query,
      option, // new: filter for attribute option values
    } = req.query;

    const match = {};

    // Handle search on name or query
    if (query || name) {
      match.name = { $regex: query || name, $options: "i" };
    }

    // Filter by attribute option if provided
    if (option) {
      match.attribute_name = { $elemMatch: { $regex: option, $options: "i" } };
    }

    if (category) match.category = category;
    if (service) match.service = service;
    if (type) match.type = type;

    // Safely parse boolean value
    if (is_active === "true" || is_active === "false") {
      match.is_active = is_active === "true";
    }

    // Date range filter
    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(dateTo);
    }

    const safeLimit = Math.max(1, parseInt(limit) || 10);
    const safePage = Math.max(1, parseInt(page) || 1);
    const skip = (safePage - 1) * safeLimit;
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      Attribute.find(match)
        .populate("category", "name")
        .populate("service", "name")
        .sort(sort)
        .skip(skip)
        .limit(safeLimit),
      Attribute.countDocuments(match),
    ]);

    res.json({
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    });
  } catch (err) {
    console.error("Error fetching attributes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

