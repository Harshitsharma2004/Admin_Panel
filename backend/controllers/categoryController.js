const EventCategory = require('../model/category');

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name, profile = "", sort_order } = req.body;
        const profilePath = req.file ? req.file.path.replace(/\\/g, "/") : "";

        // 🔒 Check for existing sort_order
        const existing = await EventCategory.findOne({ sort_order: parseInt(sort_order) });
        if (existing) {
            return res.status(409).json({ message: "Sort order already exists" });
        }

        const category = new EventCategory({
            name,
            profile: profilePath,
            sort_order: parseInt(sort_order),
        });

        await category.save();

        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        console.error("Create Category Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Get all categories with pagination, sorting, and optional search
exports.getAllCategories = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortField = "createdAt",
            sortOrder = "asc",
            searchTerm = "",
            dateFrom,
            dateTo,
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortDirection = sortOrder === "desc" ? -1 : 1;

        const matchStage = {};

        // Search by name (case-insensitive)
        if (searchTerm) {
            matchStage.name = { $regex: searchTerm, $options: "i" };
        }

        // Date range filter
        if (dateFrom || dateTo) {
            matchStage.createdAt = {};
            if (dateFrom) {
                matchStage.createdAt.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                matchStage.createdAt.$lte = endDate;
            }
        }

        // Build the aggregation pipeline
        const pipeline = [
            { $match: matchStage }
        ];

        // Case-insensitive sort on name
        if (sortField === "name") {
            pipeline.push({
                $addFields: {
                    lowerName: { $toLower: "$name" },
                },
            });
            pipeline.push({ $sort: { lowerName: sortDirection } });
        } else {
            pipeline.push({ $sort: { [sortField]: sortDirection } });
        }

        // Pagination
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });

        // Fetch paginated results
        const categories = await EventCategory.aggregate(pipeline);

        // Total count for pagination
        const total = await EventCategory.countDocuments(matchStage);

        res.status(200).json({ categories, total });
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



// Get single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await EventCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ category });
    } catch (error) {
        console.error("Get Category Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, profile, sort_order } = req.body;

    try {
        // Check if the category exists
        const category = await EventCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const oldSortOrder = category.sort_order;
        const newSortOrder = parseInt(sort_order);

        // Validate sort_order
        if (isNaN(newSortOrder)) {
            return res.status(400).json({ message: "Invalid sort_order: must be a number" });
        }

        // If sort_order is being changed, check for duplicates
        if (oldSortOrder !== newSortOrder) {
            const existingSort = await EventCategory.findOne({
                sort_order: newSortOrder,
                _id: { $ne: id }, // Exclude the current category
            });

            if (existingSort) {
                return res.status(409).json({ message: "Sort order already exists" });
            }

            // Handle sorting of other categories if sort_order is changed
            if (oldSortOrder < newSortOrder) {
                await EventCategory.updateMany(
                    {
                        sort_order: { $gt: oldSortOrder, $lte: newSortOrder },
                        _id: { $ne: id }, // Exclude the current category
                    },
                    { $inc: { sort_order: -1 } }
                );
            } else {
                await EventCategory.updateMany(
                    {
                        sort_order: { $gte: newSortOrder, $lt: oldSortOrder },
                        _id: { $ne: id }, // Exclude the current category
                    },
                    { $inc: { sort_order: 1 } }
                );
            }
        }

        // Update category fields
        category.name = name || category.name;
        category.profile = profile || category.profile;
        category.sort_order = newSortOrder || category.sort_order;

        await category.save();
        res.json({ message: "Category updated", category });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};




// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await EventCategory.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
