const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Password validation function: min 8 chars, uppercase, lowercase, digit, special char
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[\W_]/.test(password);

  return (
    typeof password === 'string' &&
    password.length >= minLength &&
    hasUpper &&
    hasLower &&
    hasDigit &&
    hasSpecial
  );
};

exports.getAllProviders = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    status,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
    sortField = "createdAt",
    sortOrder = "desc",
    query,
  } = req.query;

  try {
    // --- Build Filter ---
    const andConditions = [
      { isDeleted: false },
      { type: "Provider" }, // 🚫 Only Providers
    ];

    // Text search
    if (query) {
      const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapeRegex(query), "i");
      andConditions.push({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
        ],
      });
    }

    // Status filter
    // Status filter (based on 'status' field in DB)
    if (status) {
      const normalizedStatus = status.trim().toLowerCase();
      if (["active", "inactive"].includes(normalizedStatus)) {
        andConditions.push({
          status: new RegExp(`^${normalizedStatus}$`, "i"), // case-insensitive match
        });
      }
    }



    // Date filter
    if (dateFrom || dateTo) {
      const createdAtFilter = {};
      if (dateFrom) createdAtFilter.$gte = new Date(dateFrom);
      if (dateTo) createdAtFilter.$lte = new Date(dateTo);
      andConditions.push({ createdAt: createdAtFilter });
    }

    const filter = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    // --- Sorting ---
    const allowedSortFields = ["firstName", "lastName", "email", "createdAt", "type"];
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : "createdAt";
    const sortOptions = { [safeSortField]: sortOrder === "asc" ? 1 : -1 };

    // --- Pagination ---
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // --- Query ---
    const total = await User.countDocuments(filter);
    const sortFieldMap = {
      firstName: "$firstName",
      lastName: "$lastName",
      email: "$email",
      createdAt: "$createdAt",
      type: "$type",
    };

    const aggregationPipeline = [
      { $match: filter },
      {
        $addFields: {
          sortFieldLower: sortField === "createdAt"
            ? sortFieldMap[sortField]
            : { $toLower: sortFieldMap[sortField] },
        },
      },
      { $sort: { sortFieldLower: sortOrder === "asc" ? 1 : -1 } },
      { $skip: skip },
      { $limit: limitNumber },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          type: 1,
          status: 1,
          profile: 1,
          createdAt: 1,
        },
      },
    ];

    const providers = await User.aggregate(aggregationPipeline);


    // --- Map providers ---
    const mappedProviders = providers.map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.type,
      // status: user.status?.toLowerCase() === "inactive" ? "Inactive" : "Active",
      status: user.status,
      profile: user.profile || "",
      createdAt: user.createdAt?.toISOString() || "",
    }));

    // --- Response ---
    res.status(200).json({
      providers: mappedProviders,
      total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      message: "Providers fetched successfully",
      status: true,
    });
  } catch (err) {
    console.error("❌ Error fetching providers:", err);
    res.status(500).json({ error: "Server error", status: false });
  }
};

//Add new Provider
exports.addProvider = async (req, res) => {
  const { firstName, lastName, email, password, role = 'Provider', status = 'Active' } = req.body;

  try {
    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists", status: false });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters and include uppercase, lowercase, digit, and special character.",
        status: false
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get profile image (file path or buffer, depending on how you store)
    const profilePath = req.file ? req.file.path : null; // or req.file.buffer if storing in DB directly

    const newUser = new User({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      profile: req.file ? req.file.path : undefined, // Store the path only
      type: "Provider",
      status,
      isVerified: true
    }).save();
    console.log("newUser : ",newUser)

    // await newUser.save();

    res.status(201).json({ message: "User added successfully1111", user: newUser, status: true });
  } catch (err) {
    console.error("Admin Add User Error:", err);
    res.status(500).json({ error: "Server error", status: false });
  }
};


//edit Provider
exports.editProvider = async (req, res) => {
  const { firstName, lastName, email,role} = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found", status: false });
    }

    const normalizedEmail = email?.toLowerCase();

    if (normalizedEmail && normalizedEmail !== user.email) {
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: mongoose.Types.ObjectId(userId) },
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use", status: false });
      }

      user.email = normalizedEmail;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.type = "Provider";

    if (req.file) {
      user.profile = req.file.path.replace(/\\/g, "/");
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user,
      status: true,
    });
  } catch (err) {
    console.error("Admin edit failed:", err);
    return res.status(500).json({ error: "Server error", status: false });
  }
};

//Delete Provider
exports.deleteProvider = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted (soft)", user: updatedUser });
  } catch (error) {
    console.error("Soft delete failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};