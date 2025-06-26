const mongoose = require('mongoose');
const User = require('../model/user');
const Role = require('../model/role');
const bcrypt = require('bcrypt');

// ✅ Create SubAdmin
exports.createSubAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSubAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role,
      type: "SubAdmin",
      is_active: true,
      is_deleted: false,
    });

    await newSubAdmin.save();

    res.status(201).json({ message: "Sub Admin created successfully." });
  } catch (err) {
    console.error("Create SubAdmin Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get All SubAdmins with Filters, Pagination
exports.getAllSubAdmins = async (req, res) => {
  try {
    const {
      query = "",
      role,
      is_active,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const match = {
      is_deleted: false,
      type: "SubAdmin", // Only SubAdmins
    };

    if (query) {
      match.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    if (role) match.role = new mongoose.Types.ObjectId(role);
    if (is_active === "true" || is_active === "false") {
      match.is_active = is_active === "true";
    }

    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(dateTo);
    }

    const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const aggregatePipeline = [
      { $match: match },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role",
        },
      },
      { $unwind: "$role" },
      {
        $project: {
          name: 1,
          email: 1,
          is_active: 1,
          createdAt: 1,
          role: {
            _id: "$role._id",
            roleName: "$role.roleName",
          },
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ];

    const countPipeline = [{ $match: match }, { $count: "total" }];

    const [data, countResult] = await Promise.all([
      User.aggregate(aggregatePipeline),
      User.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    res.json({
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Get All SubAdmins Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update SubAdmin
exports.updateSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;

    const existing = await User.findOne({ _id: id, type: "SubAdmin", is_deleted: false });
    if (!existing) {
      return res.status(404).json({ message: "Sub Admin not found." });
    }

    await User.findByIdAndUpdate(id, {
      name,
      email,
      role,
      is_active,
    });

    res.json({ message: "Sub Admin updated successfully." });
  } catch (err) {
    console.error("Update SubAdmin Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Soft Delete SubAdmin
exports.deleteSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await User.findOne({ _id: id, type: "SubAdmin", is_deleted: false });
    if (!existing) {
      return res.status(404).json({ message: "Sub Admin not found." });
    }

    await User.findByIdAndUpdate(id, { is_deleted: true });

    res.json({ message: "Sub Admin deleted successfully." });
  } catch (err) {
    console.error("Delete SubAdmin Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Toggle SubAdmin Active Status
exports.updateSubAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const subAdmin = await User.findOneAndUpdate(
      { _id: id, type: "SubAdmin" },
      { is_active },
      { new: true }
    );

    if (!subAdmin) {
      return res.status(404).json({ message: "Sub Admin not found." });
    }

    res.json({ message: "Status updated successfully.", data: subAdmin });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
